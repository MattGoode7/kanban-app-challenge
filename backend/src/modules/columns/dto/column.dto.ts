export class CreateColumnDto {  
    readonly name: string;
    readonly boardId: string;
}

export class UpdateColumnDto {
    readonly name?: string;
}
  