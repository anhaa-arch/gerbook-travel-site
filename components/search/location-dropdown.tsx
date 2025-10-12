"use client";
import mnData from "@/data";
import {MapPin,ChevronRight} from "lucide-react";
import {useState} from "react";


interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

export function LocationDropdown({
  isOpen,
  onClose,
  onSelect,
}: LocationDropdownProps) {
    const [showProvinceInfo,setShowProvinceInfo] = useState(false);
    const [selectedProvince,setSelectedProvince] = useState<string | null>(null);
  if (!isOpen) return null;

  const locations = [
    "Улаанбаатар",
    "Өвөрхангай",
    "Архангай",
    "Баян-Өлгий",
    "Говь-Алтай",
  ];

  const locationData = mnData();



  return (
    <div className="absolute left-0 right-0 w-[50vw] mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className={"w-full"}>
            {
                showProvinceInfo && showProvinceInfoComp(selectedProvince ?? '')
            }
        </div>
      <div className=" overflow-auto w-full grid grid-cols-3 p-2 gap-x-2 gap-y-1">

        {!showProvinceInfo && locationData.zipcode.map((loc) => (
          <div key={loc.mnname}>
            <button
              className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-gray-50 text-sm"
              onClick={() => {
                  setShowProvinceInfo(true)
                  setSelectedProvince(loc.zipcode)
                onSelect(loc.mnname);
                // onClose();
              }}
            >
              <div className={"flex items-center gap-2"}>
                  <div className={"p-1 aspect-square flex items-center justify-center rounded-full bg-slate-100"}>
                      <MapPin height={20} className={"text-green-400"} />
                  </div>
                  <span className={"text-xs"}>
                    {loc.mnname}
                </span>

              </div> <ChevronRight height={10} />

            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function showProvinceInfoComp(zipcode: string){

    const locationData = mnData();

    const province = locationData.zipcode.find((el)=> el.zipcode == zipcode)

    return <div className={"w-full p-2 grid grid-cols-3 gap-x-2 gap-y-1"}>
        {
            province?.sub_items.map((item)=>{
                return    <div key={item.mnname}>
                    <button
                        className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                        }}
                    >
                        <div className={"flex items-center gap-2"}>
                            <div className={"p-1 aspect-square flex items-center justify-center rounded-full bg-slate-100"}>
                                <MapPin height={20} className={"text-green-400"} />
                            </div>
                            <span className={"text-xs"}>
                    {item.mnname}
                </span>

                        </div> <ChevronRight height={10} />
                    </button>
                </div>
        })}
    </div>

}