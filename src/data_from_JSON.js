import { saveToDatabase } from "./data"

let data

export default function saveDataFromJSON() {
  data.forEach((d) => saveToDatabase(d))
}