import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type Props = {
  url: string;
};

const PdfViewer = ({ url }: Props) => {
  const [pages, setPages] = useState<number>(0);

  return (
    <div>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
      >
        {Array.from(new Array(pages), (_, i) => (
          <Page key={i} pageNumber={i + 1} />
        ))}
      </Document>
    </div>
  );
};

export default PdfViewer;