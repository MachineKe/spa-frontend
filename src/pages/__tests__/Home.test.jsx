import { render, screen } from "@testing-library/react";
import Home from "../Home";

describe("Home Page", () => {
  it("renders the main heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { name: /fellas spa/i });
    expect(heading).toBeInTheDocument();
  });
});
