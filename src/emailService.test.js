import { expect } from "chai";
import { describe, it } from "mocha";
import { beautifyTitle } from "./emailService.js";

describe("beautifyTitle", () => {
  it("should correctly format a new yorker title with underscores and a date", () => {
    const title = "new_yorker.2023.02.16.epub";
    const result = beautifyTitle(title);
    expect(result).to.equal("The New Yorker 16 Feb 2023.epub");
  });

  it("should correctly format a the economist title without underscores and a date", () => {
    const title = "TheEconomist.2023.03.04.epub";
    const result = beautifyTitle(title);
    expect(result).to.equal("The Economist 4 Mar 2023.epub");
  });

  it("should correctly format a atlantic title with a single underscore and a date", () => {
    const title = "Atlantic_2022.01.02.epub";
    const result = beautifyTitle(title);
    expect(result).to.equal("The Atlantic 2 Jan 2022.epub");
  });

  it("should correctly format a wired title with a single underscore and a date", () => {
    const title = "wired_2024.06.02.epub";
    const result = beautifyTitle(title);
    expect(result).to.equal("Wired Magazine 2 Jun 2024.epub");
  });
});
