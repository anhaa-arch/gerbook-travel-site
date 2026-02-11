"use client"
import { Button, BookmarkIcon, BookmarkIconFilled } from "./button"
import { useSaved } from "@/hooks/use-saved"
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"

interface SaveButtonProps {
  id: string | number
  type: string
  data?: any
  className?: string
}

export function SaveButton({ id, type, data, className }: SaveButtonProps) {
  const { isSaved, toggleSave } = useSaved()
  const saved = isSaved(id, type)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={saved ? "Хадгалсан" : "Хадгалах"}
          className={className}
          onClick={() => toggleSave({ id, type, data })}
        >
          {saved ? <BookmarkIconFilled /> : <BookmarkIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{saved ? "Хадгалсан" : "Хадгалах"}</p>
      </TooltipContent>
    </Tooltip>
  )
} 