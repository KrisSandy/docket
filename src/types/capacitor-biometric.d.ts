declare module '@aparajita/capacitor-biometric-auth' {
  export interface CheckBiometryResult {
    isAvailable: boolean;
    biometryType: number;
  }

  export interface AuthenticateOptions {
    reason: string;
    allowDeviceCredential: boolean;
  }

  export const BiometricAuth: {
    checkBiometry(): Promise<CheckBiometryResult>;
    authenticate(options: AuthenticateOptions): Promise<void>;
  };
}
