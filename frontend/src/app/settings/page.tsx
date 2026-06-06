'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button, Input, Card, Alert } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();

  // Local state for forms
  const [teacherName, setTeacherName] = useState(settings?.teacherName || 'Dr. Sarah Jenkins');
  const [schoolName, setSchoolName] = useState(settings?.schoolName || 'Delhi Public School');
  const [schoolBranch, setSchoolBranch] = useState(settings?.schoolBranch || 'Bokaro Steel City');
  const [defaultGrade, setDefaultGrade] = useState(settings?.defaultGrade || '10');

  // Premium configurations (local state)
  const [temp, setTemp] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      teacherName,
      schoolName,
      schoolBranch,
      defaultGrade,
    });
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <AppShell title="Settings">
      <div className="max-w-3xl space-y-8 animate-fade-in">
        {successMsg && (
          <Alert type="success" message={successMsg} />
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile & School Card */}
          <Card className="p-6 md:p-8 border border-[#e8e5df] bg-[#fdfdfc] rounded-2xl space-y-6 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-[18px] text-brand mb-1">Institution & Profile</h2>
              <p className="text-[12px] text-[#9b9590]">Customize details printed on your question papers and displayed in the workspace.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-brand block">Teacher Name</label>
                <Input
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="rounded-xl border-[#e8e5df] text-[13px] bg-white h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-brand block">Default Grade</label>
                <Input
                  value={defaultGrade}
                  onChange={(e) => setDefaultGrade(e.target.value)}
                  placeholder="e.g. 10"
                  className="rounded-xl border-[#e8e5df] text-[13px] bg-white h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-brand block">School Name</label>
                <Input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="rounded-xl border-[#e8e5df] text-[13px] bg-white h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-brand block">School Branch</label>
                <Input
                  value={schoolBranch}
                  onChange={(e) => setSchoolBranch(e.target.value)}
                  placeholder="e.g. Bokaro Steel City"
                  className="rounded-xl border-[#e8e5df] text-[13px] bg-white h-11"
                  required
                />
              </div>
            </div>
          </Card>

          {/* AI LLM Settings Card */}
          <Card className="p-6 md:p-8 border border-[#e8e5df] bg-[#fdfdfc] rounded-2xl space-y-6 shadow-sm">
            <div>
              <h2 className="font-display font-bold text-[18px] text-brand mb-1">Advanced AI Parameters</h2>
              <p className="text-[12px] text-[#9b9590]">Tune the Llama generation defaults for curriculum structure & variability.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-brand">Temperature</label>
                  <span className="text-[12px] font-semibold text-brand bg-[#f0ede8] px-2 py-0.5 rounded-md">{temp}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.05"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-1.5 bg-[#eae7e1] rounded-lg appearance-none"
                />
                <p className="text-[10px] text-[#9b9590]">Lower temperature results in more factual, standardized exam formatting. Higher values produce creative problem contexts.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-brand">Max Generation Tokens</label>
                  <span className="text-[12px] font-semibold text-brand bg-[#f0ede8] px-2 py-0.5 rounded-md">{maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="1024"
                  max="8192"
                  step="256"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full accent-brand cursor-pointer h-1.5 bg-[#eae7e1] rounded-lg appearance-none"
                />
                <p className="text-[10px] text-[#9b9590]">Sets the ceiling for total length of the generated question paper. Standard exams require at least 4,096 tokens.</p>
              </div>
            </div>
          </Card>

          {/* Action Footer */}
          <div className="flex justify-end gap-3.5">
            <Button
              type="submit"
              variant="primary"
              className="px-8 py-3 rounded-full font-bold shadow-md bg-brand text-white hover:bg-neutral-800 transition-colors"
            >
              Save Configurations
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
