import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export const exportFullFamilyPDF = async (containerId: string, filename: string) => {
    const mainContainer = document.getElementById(containerId);
    if (!mainContainer) return;

    try {
        const pages = mainContainer.querySelectorAll(".pdf-page");
        if (pages.length === 0) return;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i] as HTMLElement;

            // Temporary show the page for capturing if it's hidden
            const originalStyle = page.style.display;
            page.style.display = "block";
            page.style.position = "fixed";
            page.style.top = "0";
            page.style.left = "0";
            page.style.zIndex = "-1000";

            const dataUrl = await toPng(page, {
                quality: 0.95,
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                width: 794, // Approx A4 width in pixels at 96dpi
                height: 1123, // Approx A4 height in pixels
            });

            page.style.display = originalStyle;
            page.style.position = "";
            page.style.top = "";
            page.style.left = "";
            page.style.zIndex = "";

            if (i > 0) pdf.addPage();

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (1123 * pdfWidth) / 794; // Maintain A4 ratio

            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        }

        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error("Multi-page PDF Export error:", error);
    }
};

export const exportToPDF = async (elementId: string, filename: string) => {
    const input = document.getElementById(elementId);
    if (!input) return;

    try {
        const actionButtons = input.querySelectorAll(".no-pdf");
        actionButtons.forEach((btn: any) => (btn.style.display = "none"));

        const dataUrl = await toPng(input, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
        });

        actionButtons.forEach((btn: any) => (btn.style.display = ""));

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error("Single-page PDF Export error:", error);
    }
};
