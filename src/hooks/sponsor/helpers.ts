


export function requireClubId(clubId: string | null){
    if (!clubId) throw new Error("clubId is required for sponsor mutations");
    return clubId;
}