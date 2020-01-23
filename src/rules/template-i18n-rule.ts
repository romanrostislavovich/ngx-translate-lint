// import { ASTWithSource, AttrAst, BoundTextAst, ElementAst, Interpolation, TemplateAst, TextAst } from '@angular/compiler';
// import { IRuleMetadata, RuleFailure } from 'tslint';
// import { AbstractRule } from 'tslint/lib/rules';
// import { arrayify, dedent } from 'tslint/lib/utils';
// import { SourceFile } from 'typescript';
// import { NgWalker, NgWalkerConfig } from './angular/ngWalker';
// import { BasicTemplateAstVisitor } from './angular/templates/basicTemplateAstVisitor';
// import { isNotNullOrUndefined } from './util/isNotNullOrUndefined';
//
// const OPTION_CHECK_ID: string = 'check-id';
// const OPTION_CHECK_TEXT: string = 'check-text';
//
// type CheckOption = typeof OPTION_CHECK_ID | typeof OPTION_CHECK_TEXT;
//
// interface IConfigurableVisitor {
//     getCheckOption(): CheckOption;
// }
//
// interface IFailureParameters {
//     readonly ast: AttrAst | BoundTextAst | TextAst;
//   //  readonly context: BasicTemplateAstVisitor;
//     readonly message: typeof Rule.FAILURE_STRING_ATTR | typeof Rule.FAILURE_STRING_TEXT;
// }
//
// const generateFailure: Function = (failureParameters: IFailureParameters): void => {
//     // tslint:disable-next-line:typedef
//     const {
//         sourceSpan: {
//             end: { offset: endOffset },
//             start: { offset: startOffset }
//         }
//     } = failureParameters.ast;
//
//     // @ts-ignore
//     failureParameters.context.addFailureFromStartToEnd(startOffset, endOffset, failureParameters.message);
// };
//
// export class Rule extends AbstractRule {
//     public static readonly metadata: IRuleMetadata = {
//         description: 'Ensures following best practices for i18n.',
//         optionExamples: [[true, OPTION_CHECK_ID], [true, OPTION_CHECK_TEXT], [true, OPTION_CHECK_ID, OPTION_CHECK_TEXT]],
//         options: {
//             items: {
//                 enum: [OPTION_CHECK_ID, OPTION_CHECK_TEXT],
//                 type: 'string'
//             },
//             maxLength: 2,
//             minLength: 1,
//             type: 'array'
//         },
//         optionsDescription: dedent`
//       One (or both) of the following arguments must be provided:
//       * \`${OPTION_CHECK_ID}\` Makes sure i18n attributes have ID specified
//       * \`${OPTION_CHECK_TEXT}\` Makes sure there are no elements with text content but no i18n attribute
//     `,
//         rationale: 'Makes the code more maintainable in i18n sense.',
//         ruleName: 'template-i18n',
//         type: 'maintainability',
//         typescriptOnly: true
//     };
//
//     public static readonly FAILURE_STRING_ATTR: string = 'Missing custom message identifier. For more information visit https://angular.io/guide/i18n';
//     public static readonly FAILURE_STRING_TEXT: string = 'Each element containing text node should have an i18n attribute';
//
//     public apply(sourceFile: SourceFile): RuleFailure[] {
//       // const walkerConfig: NgWalkerConfig = { templateVisitorCtrl: TemplateVisitorCtrl };
//       // tslint:disable-next-line:typedef
//       // const walker = new NgWalker(sourceFile, this.getOptions(), walkerConfig);
//
//         //return this.applyWithWalker(walker);
//     }
//
//     public isEnabled(): boolean {
//         const {
//             metadata: {
//                 options: {
//                     items: { enum: enumItems },
//                     maxLength,
//                     minLength
//                 }
//             }
//         } = Rule;
//
//         // const argumentsLength: number = this.ruleArguments.length;
//         const { length: argumentsLength } = this.ruleArguments;
//         // tslint:disable-next-line:no-any
//         // const optionArgument: any[] = arrayify(this.ruleArguments).filter(isNotNullOrUndefined);
//         const argumentsLengthInRange: boolean = argumentsLength >= minLength && argumentsLength <= maxLength;
//         // tslint:disable-next-line:typedef
//         const isOptionArgumentValid = optionArgument.length > 0 && optionArgument.every(argument => enumItems.indexOf(argument) !== -1);
//
//         return super.isEnabled() && argumentsLengthInRange && isOptionArgumentValid;
//     }
// }
//
// class TemplateVisitorAttrCtrl extends BasicTemplateAstVisitor implements IConfigurableVisitor {
//     public getCheckOption(): CheckOption {
//         return OPTION_CHECK_ID;
//     }
//
//     public visitAttr(ast: AttrAst, context: BasicTemplateAstVisitor): any {
//         this.validateAttr(ast, context);
//         super.visitAttr(ast, context);
//     }
//
//     private validateAttr(ast: AttrAst, context: BasicTemplateAstVisitor): void {
//         if (ast.name !== 'i18n') return;
//
//         // tslint:disable-next-line:typedef
//         const parts = ast.value.split('@@');
//
//         if (parts.length > 1 && parts[1].length !== 0) return;
//
//         generateFailure({ ast, context, message: Rule.FAILURE_STRING_ATTR });
//     }
// }
//
// class TemplateVisitorTextCtrl extends BasicTemplateAstVisitor implements IConfigurableVisitor {
//     private hasI18n: boolean = false;
//     private readonly nestedElements: string[] = [];
//     private readonly visited: Set<BoundTextAst | TextAst> = new Set<BoundTextAst | TextAst>();
//
//     public getCheckOption(): CheckOption {
//         return OPTION_CHECK_TEXT;
//     }
//
//     public visitBoundText(text: BoundTextAst, context: BasicTemplateAstVisitor): any {
//         this.validateBoundText(text, context);
//         super.visitBoundText(text, context);
//     }
//
//     public visitElement(element: ElementAst, context: BasicTemplateAstVisitor): any {
//         const originalI18n: boolean = this.hasI18n;
//         this.hasI18n = originalI18n || element.attrs.some(e => e.name === 'i18n');
//         this.nestedElements.push(element.name);
//         super.visitElement(element, context);
//         this.nestedElements.pop();
//         this.hasI18n = originalI18n;
//         super.visitElement(element, context);
//     }
//
//     public visitText(text: TextAst, context: BasicTemplateAstVisitor): any {
//         this.validateText(text, context);
//         super.visitText(text, context);
//     }
//
//     private validateBoundText(text: BoundTextAst, context: BasicTemplateAstVisitor): void {
//         if (this.visited.has(text)) return;
//
//         this.visited.add(text);
//
//         // @ts-ignore
//         // tslint:disable-next-line:typedef
//         const { value } = text;
//
//         if (!(value instanceof ASTWithSource) || !(value.ast instanceof Interpolation) || this.hasI18n) {
//             return;
//         }
//
//         const isTextEmpty: boolean = !value.ast.strings.some(s => /\w+/.test(s));
//
//         if (isTextEmpty) return;
//
//         generateFailure({ ast: text, context, message: Rule.FAILURE_STRING_TEXT });
//     }
//
//     private validateText(text: TextAst, context: BasicTemplateAstVisitor): void {
//         if (this.visited.has(text)) return;
//
//         this.visited.add(text);
//         // @ts-ignore
//         const isTextEmpty: boolean = text.value.trim().length === 0;
//
//         if (isTextEmpty || (this.hasI18n && this.nestedElements.length > 0)) return;
//
//         generateFailure({ ast: text, context, message: Rule.FAILURE_STRING_TEXT });
//     }
// }
//
// class TemplateVisitorCtrl extends BasicTemplateAstVisitor {
//     private readonly visitors: ReadonlyArray<BasicTemplateAstVisitor & IConfigurableVisitor> = [
//         // @ts-ignore
//         new TemplateVisitorAttrCtrl(this.getSourceFile(), this.getOptions(), this.context, this.templateStart),
//         // @ts-ignore
//         new TemplateVisitorTextCtrl(this.getSourceFile(), this.getOptions(), this.context, this.templateStart)
//     ];
//
//     public visit(node: TemplateAst, context: BasicTemplateAstVisitor): any {
//         super.visit!(node, context);
//     }
//
//     public visitAttr(ast: AttrAst, context: BasicTemplateAstVisitor): any {
//         this.validateAttr(ast);
//         super.visitAttr(ast, context);
//     }
//
//     public visitBoundText(text: BoundTextAst, context: any): any {
//         this.validateBoundText(text);
//         super.visitBoundText(text, context);
//     }
//
//     public visitElement(element: ElementAst, context: BasicTemplateAstVisitor): any {
//         this.validateElement(element);
//         super.visitElement(element, context);
//     }
//
//     public visitText(text: TextAst, context: BasicTemplateAstVisitor): any {
//         this.validateText(text);
//         super.visitText(text, context);
//     }
//
//     private validateAttr(ast: AttrAst): void {
//         // @ts-ignore
//         // tslint:disable-next-line:typedef
//         const options = this.getOptions();
//         this.visitors
//             .filter(v => options.indexOf(v.getCheckOption()) !== -1)
//             .map(v => v.visitAttr(ast, this))
//             .filter(isNotNullOrUndefined)
//             .forEach(f => {
//                 // @ts-ignore
//                 this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
//             });
//     }
//
//     private validateBoundText(text: BoundTextAst): void {
//         // @ts-ignore
//         // tslint:disable-next-line:typedef
//         const options = this.getOptions();
//         this.visitors
//             .filter(v => options.indexOf(v.getCheckOption()) !== -1)
//             .map(v => v.visitBoundText(text, this))
//             .filter(isNotNullOrUndefined)
//             .forEach(f => {
//                 // @ts-ignore
//                 return this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
//             });
//     }
//
//     private validateElement(element: ElementAst): void {
//         // @ts-ignore
//         // tslint:disable-next-line:typedef
//         const options = this.getOptions();
//         this.visitors
//             .filter(v => options.indexOf(v.getCheckOption()) !== -1)
//             .map(v => v.visitElement(element, this))
//             .filter(isNotNullOrUndefined)
//             .forEach(f => {
//                 // @ts-ignore
//                 return this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
//             });
//     }
//
//     private validateText(text: TextAst): void {
//         // @ts-ignore
//         // tslint:disable-next-line:typedef
//         const options = this.getOptions();
//
//         this.visitors
//             .filter(v => options.indexOf(v.getCheckOption()) !== -1)
//             .map(v => v.visitText(text, this))
//             .filter(isNotNullOrUndefined)
//             .forEach(f =>{
//                 // @ts-ignore
//                 return this.addFailureFromStartToEnd(f.getStartPosition().getPosition(), f.getEndPosition().getPosition(), f.getFailure(), f.getFix())
//             });
//     }
// }
