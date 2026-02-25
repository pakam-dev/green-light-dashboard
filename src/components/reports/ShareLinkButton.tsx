import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ShareLinkButtonProps {
  getToken: () => string;
}

export const ShareLinkButton = ({ getToken }: ShareLinkButtonProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  const generateLink = () => {
    const token = getToken();
    const link = `${window.location.origin}/reports/public/${token}`;
    setUrl(link);
    setOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-9"
          onClick={generateLink}
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Share this report</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Anyone with this link can view a read-only snapshot of this report.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
            <span className="flex-1 truncate text-xs text-muted-foreground font-mono">{url}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-xs text-primary font-medium">Link copied to clipboard!</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
