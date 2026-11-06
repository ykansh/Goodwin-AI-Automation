import base64

def b64(s):
    return base64.b64encode(s.encode('utf-8')).decode('utf-8')

var_map = {
    101: b64("GOODWIN BATTERIES"),
    102: b64("Your Trusted Power Source"),
    103: "${modelData}",
    104: b64("_____________________________________________________"),
    105: "${qrData}",
    106: "${serialData}",
    107: "${mfgData}",
    108: "${warrantyData}",
    109: "${serialData}"
}

xml = """<?xml version="1.0" encoding="utf-8"?>
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
				<!-- QR Code -->
				<drawobj type="drawbarcode" id="5" name="" left="100" top="800" right="1100" bottom="1800" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
					<color type="0" mode="1" table="0" change="0" varname="" index="123" colors="#000000" col="2" row="2"/>
					<barcode type="31" />
				</drawobj>
				<!-- Barcode -->
				<drawobj type="drawbarcode" id="6" name="" left="1300" top="900" right="3700" bottom="1700" rotation="none" style="0" halign="0" valign="0" tpalign="0" tvalign="0">
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
			<objvarlink link=":1,101:2,102:3,103:4,104:5,105:6,106:7,107:8,108:9,109"/>
		</labellayer>
		<variables>
"""

for key, val in var_map.items():
    xml += f"""			<variable type="constant" id="{key}" name="" shareid="" data="{val}" serialtype="0" serialstep="1" serialrepeat="1" serealreptype="0" serealreset="0" serealchars="" serealupper="" sereallower="" serealfield="" serealforder="0" serealsrc="0" databasefield="" databasegrindex="0" keyboardprompt="" datatimetype="0" datatimeoffect="0" datatimeformat="" usertc="0" rtctype="0" scripttext="" scriptpriv="">
				<limit filled="left" fillchar="0" cutout="right"/>
				<cut/>
			</variable>
"""

xml += """		</variables>
	</labelform>
	<database version="1.0">
		<Connection type="2" table="" colout="" group="1" config="" file="" parameter="">
			<fields/>
		</Connection>
	</database>
	<pictures/>
</labelshopdocument>"""

with open("temp_lsdx.xml", "w") as f:
    f.write(xml)

print("Created temp_lsdx.xml")
