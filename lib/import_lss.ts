export function import_lss(): Promise<{
  content: string;
  fileName: string;
} | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".lss";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        resolve({ content: reader.result as string, fileName: file.name });
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}