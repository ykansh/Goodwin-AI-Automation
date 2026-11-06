"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import FactoryLabel from "@/components/labels/FactoryLabel";
import { useParams } from "next/navigation";
import { getPrintCss } from "@/lib/printer-config";
import PrintControlToolbar, { DEFAULT_PRINT_SETTINGS, PrintSettings } from "@/components/labels/PrintControlToolbar";

const lsdxTemplate = `<?xml version="1.0" encoding="utf-8"?>
<labelshopdocument version="1.2" tag="for Zenpart" date="2026-09-17 12:13:50">
	<labelform version="1.1">
		<paper name="Untitled" code="0" brand="0" cate="0" syslabel="0" otype="0" type="0" maxid="37">
			<paper size="256" atuoset="0" width="3800" height="2500" orientation="1" color="255,255,255" leftoffect="0" topoffect="0"/>
			<printer name="TSC TE244" dev="TSC TE244" dpix="203" dpiy="203" lang="3" set="1610612736" total="140" repeat="1" copy="1" startrecord="-1" gcopy="1" amount="5831" dmtype="6" script="">VABTAEMAIABUAEUAMgA0ADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEEAgfcABAFDyUBAAEAAAH6AHwBZACMAAABywABAAEAywABAAAAVQBTAEUAUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAwAAAAEAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAKQAAQBNRFROAgAAAAUAAADLAAAAABkAAOQMAAAAAAAAuAsAAHAXAAAAAAAA3AUAAFgCAAAAAAAAAAAAAAAAAAD+/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANwwAANoMAAAQJwAAECcAABAnAAAQJwAAoAoAAMIGAAC4BgAALAQAAEABAADSAAAAGAAAAAAAECcQJxAnAAAQJwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGQEAQQAAAAAzhgAAAAAAAAAAAAAAAAAAAIAAgAAABIAMAAAAAEAAAAIAAAA/////wAAAAABAAAAUAAAAAAAAAC4CwAAAAAAALgLAAAAAAAAAAAAAAIAAAAAAAAAGPABAAEAAABzc3N0c2NsBA==</printer>
		</paper>
		<labellayer>
			<labelformat name="Untitled" uint="0">
				<page left="0" top="0" right="100" bottom="0" viewrotate="0"/>
				<label width="3800" height="2500" rows="1" cols="1" rowgap="300" colgap="0" rotation="0"/>
				<form corner="1" hole="0" holesize="0" order="LTH"/>
			</labelformat>
			<labelobjects>
				<!-- GOODWIN BATTERIES -->
				<drawobj type="drawtext" id="1" name="" left="100" top="100" right="1800" bottom="450" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="250" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- Your Trusted Power Source -->
				<drawobj type="drawtext" id="2" name="" left="100" top="450" right="1800" bottom="650" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="0" charset="1" height="120" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- Model -->
				<drawobj type="drawtext" id="3" name="" left="1800" top="100" right="3700" bottom="450" rotation="none" style="0" halign="2" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="200" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- Line -->
				<drawobj type="drawtext" id="4" name="" left="100" top="650" right="3700" bottom="850" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="150" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- Barcode -->
				<drawobj type="drawbarcode" id="6" name="" left="100" top="900" right="3700" bottom="1700" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<barcode type="1" />
				</drawobj>
				<!-- MFG -->
				<drawobj type="drawtext" id="7" name="" left="100" top="1900" right="1500" bottom="2100" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="150" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- WTY -->
				<drawobj type="drawtext" id="8" name="" left="100" top="2150" right="1500" bottom="2350" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="150" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
				<!-- Serial Text -->
				<drawobj type="drawtext" id="9" name="" left="1500" top="1900" right="3700" bottom="2200" rotation="none" style="0" halign="2" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<text type="1" width="0" align="0" cut="0" spactype="0" spacing="0" charextra="0" template="0" templtestr="" circr="0" circradian="0" circstart="0" circtw="0" circway="0"/>
					<font facename="Arial" style="1" charset="1" height="150" width="0" italic="0" steikeout="0" underline="0" family="0" color="0,0,0" bkcolor="255,255,255"/>
				</drawobj>
			</labelobjects>
			<objvarlink link=":1,101:2,102:3,103:4,104:6,106:7,107:8,108:9,109"/>
		</labellayer>
		<variables>
			<variable type="constant" id="101" name="" shareid="" data="R09PRFdJTiBCQVRURVJJRVM=" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="102" name="" shareid="" data="WW91ciBUcnVzdGVkIFBvd2VyIFNvdXJjZQ==" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="103" name="" shareid="" data="\${modelData}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="104" name="" shareid="" data="X19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18=" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="106" name="" shareid="" data="\${serialData}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="107" name="" shareid="" data="\${mfgData}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="108" name="" shareid="" data="\${warrantyData}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
			<variable type="constant" id="109" name="" shareid="" data="\${serialData}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
		</variables>
	</labelform>
	<database version="1.0">
		<Connection type="2" table="" colout="" group="1" config="" file="" parameter="">
			<fields/>
		</Connection>
	</database>
	<pictures/>
</labelshopdocument>
`;

export default function PrintFactoryBatchPage() {
  const params = useParams();
  const batchId = params.batchId as string;
  
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_PRINT_SETTINGS);
  const [testOnlyOne, setTestOnlyOne] = useState(false);

  useEffect(() => {
    // Load stored settings if available
    try {
      const stored = localStorage.getItem("goodwin_thermal_print_settings");
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch (e) {
      // ignore
    }

    async function loadBatch() {
      if (!batchId) return;
      const { data, error } = await supabase
        .from("sticker_batches")
        .select("*")
        .eq("id", batchId)
        .single();
      
      if (data) {
        setBatch(data);
      } else {
        console.warn("Batch not found for ID:", batchId, error);
        setBatch(null);
      }
      setLoading(false);
    }
    loadBatch();
  }, [batchId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground font-medium">Loading batch data...</div>;
  }

  if (!batch) {
    return <div className="p-8 text-center text-red-500 font-bold">Batch not found.</div>;
  }

  // Reconstruct serial numbers from batch
  const allLabels: string[] = [];
  for (let i = batch.start_sequence; i <= batch.end_sequence; i++) {
    const seqStr = String(i).padStart(5, '0');
    allLabels.push(`${batch.prefix_key}-${seqStr}`);
  }

  const labelsToPrint = testOnlyOne ? allLabels.slice(0, 1) : allLabels;

  const handlePrintAll = () => {
    setTestOnlyOne(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleTestPrint = () => {
    setTestOnlyOne(true);
    setTimeout(() => {
      window.print();
      // Reset back after dialog opens
      setTimeout(() => setTestOnlyOne(false), 1000);
    }, 100);
  };

  const handleExportLsdx = () => {
    if (!batch || allLabels.length === 0) return;
    const base64Encode = (str: string) => typeof btoa !== 'undefined' ? btoa(str) : Buffer.from(str).toString('base64');
    
    const modelData = base64Encode(batch.product_name);
    const mfgDataText = base64Encode(`Mfg: ${batch.manufacturing_date}`);
    const warrantyDataText = base64Encode(`Warranty: ${batch.warranty_duration}`);
    const serialData = base64Encode(allLabels[0] || 'SAMPLE-123');
    
    const finalLsdx = lsdxTemplate
      .replace('${modelData}', modelData)
      .replace('${serialData}', serialData) // replaces first occurrence (barcode)
      .replace('${serialData}', serialData) // replaces second occurrence (text)
      .replace('${mfgData}', mfgDataText)
      .replace('${warrantyData}', warrantyDataText);
      
    const blob = new Blob([finalLsdx], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_${batchId}.lsdx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="print-page-wrapper min-h-screen bg-background">
      {/* Live Thermal Fine-Tuning Toolbar */}
      <PrintControlToolbar
        backHref="/admin/serial-generator"
        title={`Print Preview: ${batch.product_name}`}
        labelCount={allLabels.length}
        settings={settings}
        onSettingsChange={setSettings}
        onPrintAll={handlePrintAll}
        onPrintTest={handleTestPrint}
        onExportLsdx={handleExportLsdx}
      />

      {/* Printable area styling */}
      <style dangerouslySetInnerHTML={{ __html: getPrintCss(settings.verticalOffset) }} />

      {/* Setup Guide for TSC TE244 Non-Hazy Quality */}
      <div className="print:hidden bg-slate-900 text-white border-b border-slate-800 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-green-500 text-black px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Thermal Pro Tip
          </span>
          <span className="text-slate-300">
            For crystal-clear, non-hazy print: In Chrome Print (<kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-white border border-slate-700">Ctrl+P</kbd>) &rarr; More settings &rarr; set <strong>Margins: None</strong> &amp; <strong>Scale: 100%</strong>. If your printer feeds high or low, use the <strong>Nudge</strong> control in the toolbar.
          </span>
        </div>
      </div>

      {/* Visual notice if test mode is active */}
      {testOnlyOne && (
        <div className="print:hidden bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs font-bold text-amber-600">
          Printing 1 Test Sticker to check thermal clarity on DC Code printer...
        </div>
      )}

      {/* Preview container (styled for screen, reset for 38x25mm thermal print) */}
      <div className="print-labels-container flex flex-wrap gap-4 p-8 print:p-0 bg-background print:bg-white pb-20 print:pb-0 justify-center print:justify-start">
        {labelsToPrint.map((serial) => (
          <div 
            key={serial} 
            className="print-label-item bg-white overflow-hidden"
            style={{ border: '0 none transparent', outline: '0 none transparent', boxShadow: 'none', borderRadius: '0' }}
          >
            <FactoryLabel
              serialNumber={serial}
              productModel={batch.product_name}
              warranty={batch.warranty_duration}
              mfgDate={batch.manufacturing_date}
              logoFont={settings.logoFont}
              bodyFont={settings.bodyFont}
              serialFont={settings.serialFont}
              letterSpacing={settings.letterSpacing}
              showBarcode={settings.showBarcode}
              verticalOffset={settings.verticalOffset}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
