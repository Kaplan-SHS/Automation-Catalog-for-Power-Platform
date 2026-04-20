// KI Automation Hub — Org Impact Model
// Kaplan International

namespace ACPP.API.Models
{
    public class OrgImpactModel
    {
        public double TotalHoursSaved { get; set; }
        public int TotalRuns { get; set; }
        public int ActiveUsers { get; set; }
        public int TotalAutomationsInstalled { get; set; }
        public TopAutomationModel? TopAutomation { get; set; }
        public List<MonthlyTrendModel> MonthlyTrend { get; set; } = new();
        public List<CategoryBreakdownModel> CategoryBreakdown { get; set; } = new();
    }

    public class TopAutomationModel
    {
        public string Name { get; set; } = string.Empty;
        public int Runs { get; set; }
        public double HoursSaved { get; set; }
    }

    public class MonthlyTrendModel
    {
        public string Month { get; set; } = string.Empty;
        public double HoursSaved { get; set; }
        public int Runs { get; set; }
    }

    public class CategoryBreakdownModel
    {
        public string Category { get; set; } = string.Empty;
        public double HoursSaved { get; set; }
        public int Runs { get; set; }
    }
}
