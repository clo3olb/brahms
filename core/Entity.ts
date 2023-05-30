class Data {
  name: string;
  verfier: Verifier;

  constructor(name: string, verifier: Verifier = undefined) {
    this.name = name;
    this.verfier = verifier;
  }

  verify(value: any): void {
    if (!this.verfier) {
      return;
    }

    this.verfier(value);
  }
}

type Entity<T> = {
  [property in keyof T]: Data;
};
