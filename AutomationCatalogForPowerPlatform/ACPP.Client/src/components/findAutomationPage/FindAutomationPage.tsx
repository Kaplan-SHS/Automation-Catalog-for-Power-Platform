// KI Automation Hub — Find My Automation Page
// Kaplan International

import * as React from 'react';

const FindAutomationPage: React.FC = () => {
  return (
    <div style={{ width: '100%', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <iframe
        src="https://copilotstudio.microsoft.com/environments/921ca2e8-4e47-e92a-a554-986e4a9a7b0d/bots/crdeb_agent/canvas?__version__=2&enableFileAttachment=true"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="KI Automation Assistant"
        allow="microphone"
      />
    </div>
  );
};

export default FindAutomationPage;
