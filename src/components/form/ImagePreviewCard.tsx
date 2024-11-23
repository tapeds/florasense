import { GiCancel } from "react-icons/gi";

import Typography from "@/components/Typography";
import clsxm from "@/lib/clsxm";
import ImagePreview from "@/components/form/ImagePreview";

type ImagePreviewCardProps = {
  imgPath: string;
  label?: string;
  caption?: string;
  withFetch?: boolean;
  onDelete?: () => void;
  onDeleteLoading?: boolean;
} & React.ComponentPropsWithoutRef<"div">;

export default function ImagePreviewCard({
  imgPath,
  label = "",
  onDelete,
  onDeleteLoading,
}: ImagePreviewCardProps) {
  return (
    <div className="group relative flex items-center gap-x-4 rounded-xl border border-typo-inline p-3 md:p-4">
      <ImagePreview
        imgSrc={imgPath}
        alt={label}
        label={label}
        width={80}
        height={80}
        className="w-16 md:w-20"
        imgClassName="rounded-md"
      />
      <div className="w-full space-y-1.5 md:space-y-4">
        <Typography className="text-xs text-black">{label}</Typography>
      </div>
      {onDelete && (
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-800"
          type="button"
        >
          <GiCancel
            size={26}
            className={clsxm(onDeleteLoading && "animate-spin")}
          />
        </button>
      )}
    </div>
  );
}
