type Schema = {
  header: string;
  verifier: Verifier;
};

type TableSchema<T> = {
  [property in keyof T]: Schema;
};
