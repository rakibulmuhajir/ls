// src/utils/UniqueID.ts

let counter = 0;

export class UniqueID {
  public static generate(prefix: string = 'id_'): string {
    counter++;
    return `${prefix}${Date.now()}_${counter}`;
  }

  public static resetCounter(): void { // Optional: for testing or specific reset scenarios
    counter = 0;
  }
}
