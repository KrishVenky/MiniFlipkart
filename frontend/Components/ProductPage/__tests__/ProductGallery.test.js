import { render, screen, fireEvent } from "@testing-library/react";
import ProductGallery from "../ProductGallery";

describe("ProductGallery", () => {
  const mockImages = ["/img1.jpg", "/img2.jpg", "/img3.jpg"];

  test("renders main image", () => {
    render(<ProductGallery images={mockImages} productTitle="Test Product" />);
    expect(screen.getByAltText(/test product - image 1/i)).toBeInTheDocument();
  });

  test("renders thumbnails when multiple images", () => {
    render(<ProductGallery images={mockImages} productTitle="Test Product" />);
    expect(screen.getAllByAltText(/thumbnail/i)).toHaveLength(3);
  });

  test("switches image on thumbnail click", () => {
    render(<ProductGallery images={mockImages} productTitle="Test Product" />);
    const thumbnails = screen.getAllByAltText(/thumbnail/i);
    fireEvent.click(thumbnails[1]);
    expect(screen.getByAltText(/test product - image 2/i)).toBeInTheDocument();
  });

  test("uses fallback when no images provided", () => {
    render(<ProductGallery images={[]} productTitle="Test Product" />);
    expect(screen.getByAltText(/test product - image 1/i)).toHaveAttribute("src", "/imgs/default.png");
  });
});

