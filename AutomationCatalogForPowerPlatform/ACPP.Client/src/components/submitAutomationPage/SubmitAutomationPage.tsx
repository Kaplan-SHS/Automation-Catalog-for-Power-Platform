// KI Automation Hub — Submit Automation Page
// Kaplan International

import * as React from 'react';
import { useState } from 'react';
import { LargeTitle, Text, Button, Input, Textarea, Radio, RadioGroup } from '@fluentui/react-components';
import { CheckmarkCircle24Regular, ArrowUpload24Regular, Lightbulb24Regular } from '@fluentui/react-icons';
import { DisplayCanvas } from '../../common/controls/DisplayCanvas/DisplayCanvas';
import { RootCanvas } from '../../common/controls/RootCanvas/RootCanvas';

const SubmitAutomationPage: React.FC = () => {
  const [submitType, setSubmitType] = useState<'file' | 'idea'>('idea');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timeSaving, setTimeSaving] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !description) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setDescription('');
    setTimeSaving('');
    setFile(null);
    setSubmitType('idea');
  };

  if (submitted) {
    return (
      <RootCanvas>
        <DisplayCanvas>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px', textAlign: 'center', padding: '40px' }}>
            <CheckmarkCircle24Regular style={{ width: 64, height: 64, color: '#003087' }} />
            <LargeTitle>Thank you!</LargeTitle>
            <Text size={400} style={{ color: 'var(--color-text-secondary)', maxWidth: '500px' }}>
              Your {submitType === 'file' ? 'automation' : 'idea'} has been submitted. Our team will review it and add it to the catalog if approved.
            </Text>
            <Button appearance="primary" style={{ backgroundColor: '#003087', marginTop: '16px' }} onClick={handleReset}>
              Submit another
            </Button>
          </div>
        </DisplayCanvas>
      </RootCanvas>
    );
  }

  return (
    <RootCanvas>
      <DisplayCanvas>
        <div style={{ padding: '32px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div>
            <LargeTitle style={{ color: '#003087' }}>Share your automation</LargeTitle>
            <Text size={400} style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '8px' }}>
              Help your colleagues work smarter. Submit a ready-made automation or suggest an idea for the team to build.
            </Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text weight="semibold">What would you like to do?</Text>
            <RadioGroup value={submitType} onChange={(_, data) => setSubmitType(data.value as 'file' | 'idea')} layout="horizontal">
              <Radio value="idea" label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lightbulb24Regular style={{ width: 18, height: 18 }} /> Suggest an idea
                </span>
              } />
              <Radio value="file" label={
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ArrowUpload24Regular style={{ width: 18, height: 18 }} /> Upload an automation file
                </span>
              } />
            </RadioGroup>
          </div>

          {submitType === 'file' && (
            <div style={{ backgroundColor: 'var(--color-background-secondary)', borderRadius: '8px', padding: '16px', border: '1px solid var(--color-border-tertiary)' }}>
              <Text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>How to export your automation</Text>
              <Text size={300} style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: '12px' }}>
                In Power Automate, open your flow → click the three dots (···) → Export → Package (.zip). Then upload the ZIP file below.
              </Text>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={{ fontSize: '14px' }}
              />
              {file && <Text size={300} style={{ color: '#003087', display: 'block', marginTop: '8px' }}>✓ {file.name} selected</Text>}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text weight="semibold">Automation name *</Text>
            <Input
              placeholder="e.g. Auto-reply to meeting invites"
              value={name}
              onChange={(_, data) => setName(data.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text weight="semibold">Description *</Text>
            <Textarea
              placeholder="Describe what this automation does and which problem it solves..."
              value={description}
              onChange={(_, data) => setDescription(data.value)}
              rows={4}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Text weight="semibold">Estimated time saved</Text>
            <Input
              placeholder="e.g. 10 minutes per day"
              value={timeSaving}
              onChange={(_, data) => setTimeSaving(data.value)}
            />
          </div>

          <Button
            appearance="primary"
            style={{ backgroundColor: '#003087', width: 'fit-content' }}
            onClick={handleSubmit}
            disabled={!name || !description}
          >
            Submit
          </Button>

        </div>
      </DisplayCanvas>
    </RootCanvas>
  );
};

export default SubmitAutomationPage;
