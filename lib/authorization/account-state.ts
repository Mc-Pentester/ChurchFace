export interface AccountState {
  isBanned: boolean;
  isSuspended: boolean;
}

export function isAccountBlocked(state: AccountState): boolean {
  return state.isBanned || state.isSuspended;
}

export function getAccountStateReason(state: AccountState): string | null {
  if (state.isBanned && state.isSuspended) {
    return "Account is banned and suspended";
  }

  if (state.isBanned) {
    return "Account is banned";
  }

  if (state.isSuspended) {
    return "Account is suspended";
  }

  return null;
}
