import { Action } from '@ngrx/store';

export enum ArtProofActionTypes {
    AddArtProof = '[Art Proof] Add art proof',
    AddArtProofSuccess = '[Art Proof] Add art proof success',
    AddArtProofError = '[Art Proof] Add art proof failure',
    DeleteArtProof = "DeleteArtProof",
    DeleteArtProofSuccess = "DeleteArtProofSuccess",
    DeleteArtProofError = "DeleteArtProofError"
}

export class AddArtProof implements Action {
    readonly type = ArtProofActionTypes.AddArtProof;
    constructor(public payload: { id: string }) { }
}
export class AddArtProofSuccess implements Action {
    readonly type = ArtProofActionTypes.AddArtProofSuccess;
    constructor(public payload: any) { }
}
export class AddArtProofError implements Action {
    readonly type = ArtProofActionTypes.AddArtProofError;
    constructor(public payload: any) { }
}

export class DeleteArtProof implements Action {
    readonly type = ArtProofActionTypes.DeleteArtProof;
    constructor(public payload: { id: string }) { }
}
export class DeleteArtProofSuccess implements Action {
    readonly type = ArtProofActionTypes.DeleteArtProofSuccess;
    constructor(public payload: any) { }
}
export class DeleteArtProofError implements Action {
    readonly type = ArtProofActionTypes.DeleteArtProofError;
    constructor(public payload: any) { }
}

export type ArtProofActions = AddArtProof | AddArtProofSuccess | AddArtProofError 
    | DeleteArtProof | DeleteArtProofSuccess | DeleteArtProofError;