public async Task<OrgImpactModel> GetOrgImpact(string? envUrl)
        {
            try
            {
                string[] scopes = new[] { $"{envUrl ?? _configuration.CatalogEnvUrl}/{_configuration.TokenScope}" };
                string token = await GetTokenForCatalog(scopes);
                string queryParameters = $"/?$select=_mspcat_catalogitem_value,createdon,mspcat_templatesuffixid,mspcat_settings,mspcat_environmenturl&$expand=mspcat_CatalogItem&$filter=statuscode eq 526430003 and _mspcat_publisher_value eq {_configuration.PublisherId}";
                var value = await makeHttpCall(_configuration.TokenScope, token, queryParameters, _configuration.CatalogEnvUrl, _configuration.InstallHistoriesEndPoint, true);

                if (string.IsNullOrEmpty(value))
                    return new OrgImpactModel();

                List<InstalledSolutionTemplateCardModel> allItems = JsonConvert.DeserializeObject<List<InstalledSolutionTemplateCardModel>>(value);
                if (allItems == null)
                    return new OrgImpactModel();

                var tasks = allItems.Select(item => PopulateItemDetails(item)).ToArray();
                await Task.WhenAll(tasks);

                double totalMinutesSaved = 0;
                int totalRuns = 0;
                var activeUserIds = new HashSet<string>();
                var automationStats = new Dictionary<string, (string name, int runs, double minutes)>();
                var monthlyData = new Dictionary<string, (double minutes, int runs)>();

                foreach (var item in allItems)
                {
                    if (item.objectId != null)
                        activeUserIds.Add(item.objectId);

                    totalRuns += item.flowRuns;

                    double minutesSaved = 0;
                    if (item.mspcat_CatalogItem?.TimeSavingValue != null &&
                        double.TryParse(item.mspcat_CatalogItem.TimeSavingValue, out double savingValue))
                    {
                        string timeSavingType = item.mspcat_CatalogItem.TimeSavingType ?? "0";
                        switch (timeSavingType)
                        {
                            case "919440000": // Per run
                                minutesSaved = savingValue * item.flowRuns;
                                break;
                            case "919440001": // Per day
                                minutesSaved = savingValue * item.noOfDaysWithAtleastOneSuccessfulRun;
                                break;
                            case "919440002": // Per week
                                minutesSaved = savingValue * item.noOfWeeksWithAtleastOneSuccessfulRun;
                                break;
                        }
                    }

                    totalMinutesSaved += minutesSaved;

                    string autoName = item.mspcat_CatalogItem?.SolutionName ?? "Unknown";
                    if (!automationStats.ContainsKey(autoName))
                        automationStats[autoName] = (autoName, 0, 0);
                    var existing = automationStats[autoName];
                    automationStats[autoName] = (autoName, existing.runs + item.flowRuns, existing.minutes + minutesSaved);

                    if (DateTime.TryParse(item.InstalledOn, out DateTime installedDate))
                    {
                        string monthKey = installedDate.ToString("MMM");
                        if (!monthlyData.ContainsKey(monthKey))
                            monthlyData[monthKey] = (0, 0);
                        var m = monthlyData[monthKey];
                        monthlyData[monthKey] = (m.minutes + minutesSaved, m.runs + item.flowRuns);
                    }
                }

                double totalHoursSaved = totalMinutesSaved / 60.0;

                var topAuto = automationStats.Values
                    .OrderByDescending(a => a.runs)
                    .FirstOrDefault();

                return new OrgImpactModel
                {
                    TotalHoursSaved = Math.Round(totalHoursSaved, 1),
                    TotalRuns = totalRuns,
                    ActiveUsers = activeUserIds.Count,
                    TotalAutomationsInstalled = allItems.Count,
                    TopAutomation = topAuto.name != null ? new TopAutomationModel
                    {
                        Name = topAuto.name,
                        Runs = topAuto.runs,
                        HoursSaved = Math.Round(topAuto.minutes / 60.0, 1)
                    } : null,
                    MonthlyTrend = monthlyData.Select(m => new MonthlyTrendModel
                    {
                        Month = m.Key,
                        HoursSaved = Math.Round(m.Value.minutes / 60.0, 1),
                        Runs = m.Value.runs
                    }).ToList()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting org impact data");
                return new OrgImpactModel();
            }
        }
