export class CreateCardDto {
    readonly title: string;
    readonly description?: string;
    readonly columnId: string;
  }

  export class UpdateCardDto {
        readonly title?: string;
        readonly description?: string;
        readonly columnId?: string;
}  