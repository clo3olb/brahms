function emailVerifier(value: string) {
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(value))
    throw `Email Verifier - ${value} is not a correct email`;
}

function numberVerifier(value: string) {
  if (value == undefined) throw `Number Verifier - ${value} is undefined`;
  if (isNaN(Number(value))) throw `Number Verifier - ${value} is Not a Number`;
}

type Verifier = (value: string) => void;

const VERIFIER = {
  EMAIL: emailVerifier,
  NUMBER: numberVerifier,
};
