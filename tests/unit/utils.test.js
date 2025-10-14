const { format_date, normalize_data, convertStringToNumber } = require("../../utils")

describe("Utils tests", () => {
    it("should return 2025/10/10", () => {
        let date = format_date("10/10/2025");

        expect(date).toStrictEqual(new Date("2025/10/10"));
    });

    it("should return 1 of data type integer when 1 of data type string passed", () => {
        expect(convertStringToNumber("1")).toBe(1);
    });

    it("should return 9 of data type integer when 8 of data type string passed", () => {
        expect(convertStringToNumber("1")).toBe(1);
    });

    it("should return ", () => {
        let data = normalize_data();

        expect(data).toBe({

        })
    })
});