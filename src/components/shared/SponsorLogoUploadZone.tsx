import { CloudUpload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUploadThing } from '@/lib/uploadthing';

interface SponsorLogoUploadZoneProps {
	logoUrl: string;
	onLogoUrlChange: (nextUrl: string) => void;
	disabled?: boolean;
	label?: string;
	hint?: string;
}

export function SponsorLogoUploadZone({
	logoUrl,
	onLogoUrlChange,
	disabled = false,
	label = 'UPLOAD LOGO',
	hint = 'Logo can be auto-fetched from URL or uploaded',
}: SponsorLogoUploadZoneProps) {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [isUploadingFile, setIsUploadingFile] = useState(false);

	const { startUpload } = useUploadThing('sponsorLogoUploader', {
		onClientUploadComplete: (files) => {
			const uploaded = files?.[0];
			if (!uploaded?.ufsUrl) {
				toast.error('Upload finished but no file URL was returned.');
				return;
			}
			onLogoUrlChange(uploaded.ufsUrl);
			toast.success('Logo uploaded successfully');
		},
		onUploadError: (error: Error) => {
			toast.error(error.message || 'Failed to upload logo');
		},
	});

	const handleFileSelection = async (file: File | null) => {
		if (!file || disabled || isUploadingFile) return;

		setIsUploadingFile(true);
		try {
			await startUpload([file]);
		} finally {
			setIsUploadingFile(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleBrowseClick = () => {
		if (disabled || isUploadingFile) return;
		fileInputRef.current?.click();
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (disabled || isUploadingFile) return;
		void handleFileSelection(event.dataTransfer.files?.[0] ?? null);
	};

	return (
		<div className="space-y-[10px]">
			<p className="text-xs font-medium uppercase tracking-normal text-[#010a04]/70">{label}</p>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg,application/pdf"
				className="hidden"
				onChange={(event) => void handleFileSelection(event.target.files?.[0] ?? null)}
				disabled={disabled || isUploadingFile}
			/>

			<div
				onDragOver={(event) => event.preventDefault()}
				onDrop={handleDrop}
				className="flex w-full flex-col items-center justify-center gap-[15px] rounded-[8px] border-[1.5px] border-dashed border-[#067429] bg-[#06742914] px-3 py-[25px]"
			>
				<CloudUpload className="size-5 text-[#067429]" />
				<div className="flex flex-col items-center justify-center gap-[14px] text-[#010a04]">
					<p className="text-sm leading-normal">
						{isUploadingFile ? (
							<span>Uploading file...</span>
						) : (
							<>
								<span>Drag &amp; Drop or </span>
								<button
									type="button"
									onClick={handleBrowseClick}
									disabled={disabled || isUploadingFile}
									className="font-medium text-[#067429] underline underline-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
								>
									Browse File
								</button>
							</>
						)}
					</p>
					<p className="text-xs leading-normal text-[#010a04]/60">Supports: PNG, JPEG, JPG, PDF. Max 10 MB</p>
				</div>
			</div>

			<p className="text-[11px] leading-normal text-[#010a04]/60">{hint}</p>

			{logoUrl ? (
				<p className="text-[11px] leading-normal text-[#010a04]/60">
					Uploaded:{' '}
					<a
						href={logoUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="font-medium text-[#067429] underline underline-offset-2"
					>
						Open uploaded file
					</a>
				</p>
			) : null}
		</div>
	);
}