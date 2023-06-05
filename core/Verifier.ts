function emailVerifier(value: string) {
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value))
    throw `Email Verifier - ${value} is not a correct email`;
}

function numberVerifier(value: string) {
  if (value == undefined) throw `Number Verifier - ${value} is undefined`;
  if (isNaN(Number(value))) throw `Number Verifier - ${value} is Not a Number`;
}

function textVerifier(value: string) {
  if (value == undefined) throw `Text Verifier - ${value} is undefined`;
}

function genderVerifier(value: string) {
  if (value !== "남" && value !== "여")
    throw `Gender Verifier - ${value} is not a gender`;
}

function categoryVerifier(value: string) {
  if (value !== "TOEFL" && value !== "SAT")
    throw `Category Verifier - ${value} is not a correct category`;
}

type Verifier = (value: string) => void;

const VERIFIER = {
  EMAIL: emailVerifier,
  NUMBER: numberVerifier,
  TEXT: textVerifier,
  GENDER: genderVerifier,
  CATEGORY: categoryVerifier,
};
