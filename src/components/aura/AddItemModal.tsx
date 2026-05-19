import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useAura } from "@/components/aura/store";
import type { Category } from "@/lib/aura";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddItemModal() {
  const { addItemOpen, closeAddItem, addGarment } = useAura();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [name, setName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setSelectedCategory("");
    setName("");
  }

  function handleClose() {
    reset();
    closeAddItem();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const trimmedName = name.trim();
  const canSubmit = !!selectedFile && !!selectedCategory && trimmedName.length > 0;

  function confirmAdd() {
    if (!selectedFile || !selectedCategory || !trimmedName) return;
    const reader = new FileReader();
    reader.onload = () => {
      addGarment({
        id: `u-${Date.now()}`,
        name: trimmedName,
        category: selectedCategory,
        color: "#C9A98E",
        imageUrl: reader.result as string,
        dateAdded: new Date().toISOString(),
      });
      toast.success("Item added!", { position: "bottom-center", duration: 2000 });
      handleClose();
    };
    reader.readAsDataURL(selectedFile);
  }

  return (
    <Dialog open={addItemOpen} onOpenChange={(o) => (o ? null : handleClose())}>
      <DialogContent className="bg-card sm:max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add to Wardrobe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border border-border overflow-hidden"
              >
                <img
                  src={previewUrl}
                  alt="Selected garment"
                  className="w-full h-48 object-contain bg-secondary/30"
                />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 hover:bg-secondary/50"
              >
                <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.25} />
                <span className="text-sm text-muted-foreground">Tap to upload an image</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. White linen shirt"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Category
            </label>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as Category)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Tops</SelectItem>
                <SelectItem value="bottom">Bottoms</SelectItem>
                <SelectItem value="dress">Dresses & Coats</SelectItem>
                <SelectItem value="shoes">Shoes</SelectItem>
                <SelectItem value="accessory">Accessories</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={confirmAdd}
            disabled={!canSubmit}
            className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Add Item
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
