import Papa from 'papaparse'
import fs from 'node:fs';


var csvFile = "Z:\\Banken und Werte\\20250202-Export-Alle_Buchungen.csv";
const csvString = fs.readFileSync(csvFile, 'utf8');

var results = Papa.parse(csvString, {
    header: true,
});
console.log(results)

var categories = new Set();
var allCategories = new Set();

var categoryMapping = JSON.parse(fs.readFileSync("mapping.json", 'utf8'));

var categoryMappingSet = new Set(Object.keys(categoryMapping));


var groups = results.data.reduce((groups, item) => {
    item["Payee"] = item["Beguenstigter/Auftraggeber"] + " (" + item["IBAN Beguenstigter/Auftraggeber"] + ")";
    item["Notes"] = item["Verwendungszweck"];
    item["CategoryOld"] = item["Analyse-Hauptkategorie"] + " - " + item["Analyse-Unterkategorie"];
    if (!categoryMappingSet.has(item["CategoryOld"])) {
        categories.add(item["CategoryOld"])
    }
    allCategories.add(item["CategoryOld"])
    item["Category"] = categoryMapping[item["CategoryOld"]] || undefined;
    // delete item["CategoryOld"];
    delete item["Verwendungszweck"];
    delete item["E-Ref"]
    delete item["Mandatsreferenz"]
    delete item["Analyse-Hauptkategorie"]
    delete item["Analyse-Unterkategorie"]
    delete item["Analyse-Vertrag"]
    delete item["Analyse-Vertragsturnus"]
    delete item["Analyse-Vertrags-ID"]
    delete item["Analyse-Umbuchung"]
    delete item["Analyse-Vom frei verfuegbaren Einkommen ausgeschlossen"]
    delete item["Analyse-Umsatzart"]
    delete item["Analyse-Betrag"]
    delete item["Analyse-Woche"]
    delete item["Analyse-Monat"]
    delete item["Analyse-Quartal"]
    delete item["Analyse-Jahr"]
    delete item["Glaeubiger-ID"]
    delete item["Beguenstigter/Auftraggeber"]
    delete item["IBAN Beguenstigter/Auftraggeber"]
    // delete item["Kontostand"]
    const group = (groups[item["Referenzkonto"]] || []);
    group.push(item);
    groups[item["Referenzkonto"]] = group;
    return groups;
  }, {});
console.log(groups)


for (const [key, value] of Object.entries(groups)) {
    console.log(`${key}: ${value}`);
    var csv = Papa.unparse(value);
    fs.writeFileSync(`./export/${key}.csv`, csv);

  }

// Write categories to file
fs.writeFileSync(`./export/categories.txt`, Array.from(categories).join("\n"));
const diff = Array.from(categoryMappingSet).filter(x => !allCategories.has(x));
fs.writeFileSync(`./export/non-usedcategories.txt`, Array.from(diff).join("\n"));