import bcrypt from "bcrypt";
import { createHash } from "node:crypto";
import { strongPasswordRegex } from "../constants/global.constant";

export default class EncryptionService {
  checkPasswordStrength(password: string): boolean {
    if (!strongPasswordRegex.test(password)) {
      return false;
    }
    return true;
  }

  async hashPassword(password: string): Promise<string> {
    const encryptedPassword = await bcrypt.hash(password, 10);
    return encryptedPassword;
  }

  async comparePassword(
    password: string,
    storedPassword: string
  ): Promise<boolean> {
    const _checkPassword = await bcrypt.compare(storedPassword, password);
    return _checkPassword;
  }

  async hashString(string: string): Promise<string> {
    const hashedString = createHash("sha512")
      .update(String(string))
      .digest("hex");
    return hashedString;
  }
}
