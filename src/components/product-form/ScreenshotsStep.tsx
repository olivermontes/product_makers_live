'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle, ImageIcon, Upload, X } from 'lucide-react'
import { useProductFormProvider } from '@/contexts/ProductFormContext'
import { formatBytes } from '@/lib/utils'

export function ScreenshotsStep() {
  const {
    screenshotFiles,
    isDragging,
    screenshotErrors,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    openFileDialog,
    removeFile,
    clearFiles,
    getInputProps
  } = useProductFormProvider()

  return (
    <div className="flex flex-col gap-2">
      {/* Drop area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        data-files={screenshotFiles.length > 0 || undefined}
        className="border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors not-data-[files]:justify-center has-[input:focus]:ring-[3px]"
      >
        <input
          {...getInputProps()}
          className="sr-only"
          aria-label="Upload image file"
        />
        <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
          <div
            className="bg-background mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <ImageIcon className="size-4 opacity-60" />
          </div>
          <p className="mb-1.5 text-sm font-medium">Arrastra tus imágenes aquí</p>
          <p className="text-muted-foreground text-xs">
            SVG, PNG, JPG o GIF (max. 5MB)
          </p>
          <Button variant="outline" className="mt-4 gap-2" onClick={openFileDialog}>
            <Upload size={20} aria-hidden="true" />
            Seleccionar imágenes
          </Button>
        </div>
      </div>

      {screenshotErrors.length > 0 && (
        <div
          className="text-destructive flex items-center gap-1 text-xs"
          role="alert"
        >
          <AlertCircle className="size-3 shrink-0" />
          <span>{screenshotErrors[0]}</span>
        </div>
      )}

      {/* File list */}
      {screenshotFiles.length > 0 && (
        <div className="space-y-2">
          {screenshotFiles.map((file) => (
            <div
              key={file.id}
              className="bg-background flex items-center justify-between gap-2 rounded-lg border p-2 pe-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-accent aspect-square shrink-0 rounded">
                  <img
                    src={file.preview}
                    alt={file.file instanceof File ? file.file.name : 'Preview'}
                    className="size-10 rounded-[inherit] object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[13px] font-medium">
                    {file.file instanceof File ? file.file.name : 'Preview'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {file.file instanceof File ? formatBytes(file.file.size) : ''}
                  </p>
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground/80 hover:text-foreground -me-2 size-8 hover:bg-transparent"
                onClick={() => removeFile(file.id)}
                aria-label="Remove file"
              >
                <X aria-hidden="true" />
              </Button>
            </div>
          ))}

          {/* Remove all files button */}
          {screenshotFiles.length > 1 && (
            <div>
              <Button size="sm" variant="outline" onClick={clearFiles}>
                Eliminar todas
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 