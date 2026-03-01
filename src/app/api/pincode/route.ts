import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get("code");

        if (!code || code.length !== 6 || isNaN(Number(code))) {
            return NextResponse.json({ error: "Invalid 6-digit Pincode" }, { status: 400 });
        }

        const externalRes = await fetch(`https://api.postalpincode.in/pincode/${code}`);
        const data = await externalRes.json();

        if (data && data.length > 0 && data[0].Status === "Success") {
            const postOffices = data[0].PostOffice;
            if (!postOffices || postOffices.length === 0) {
                return NextResponse.json({ error: "No location found for this Pincode" }, { status: 404 });
            }

            // We pick the first one which usually has the correct District/State
            const info = postOffices[0];
            let activeSubDistrict = info.Block === "NA" ? info.District : info.Block;
            const villageNames = postOffices.map((po: any) => po.Name);

            try {
                // Cross-reference with our Supabase Location DB to find the exact Tehsil
                if (villageNames && villageNames.length > 0) {
                    for (let i = 0; i < Math.min(villageNames.length, 5); i++) {
                        const vName = villageNames[i].split(" ")[0] + "%"; // match the first word
                        const locData = await supabase
                            .from('Location')
                            .select('subDistrict')
                            .ilike('district', info.District)
                            .ilike('village', vName)
                            .limit(1)
                            .all();

                        if (locData && locData.length > 0 && locData[0].subDistrict) {
                            activeSubDistrict = locData[0].subDistrict;
                            break;
                        }
                    }
                }
            } catch (e) { /* ignore DB search failure and fallback to postal block */ }

            return NextResponse.json({
                state: info.State?.trim(),
                district: info.District?.trim(),
                subDistrict: activeSubDistrict?.trim(),
                villages: villageNames // Optional: list of village/PO names linked
            });
        }

        return NextResponse.json({ error: "No location found for this Pincode" }, { status: 404 });

    } catch (error) {
        console.error("Pincode APi Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
