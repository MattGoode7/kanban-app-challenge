export class CreateColumnDto {  
    readonly title: string;
    readonly boardId: string;
}

export class UpdateColumnDto {
    readonly title?: string;
}
  