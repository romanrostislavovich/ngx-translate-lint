// import * as ast from '@angular/compiler';
// import * as ts from 'typescript';
// import * as Lint from 'tslint';
// import * as e from '@angular/compiler/src/expression_parser/ast';
//
// import { ExpTypes } from '../expressionTypes';
// import { ComponentMetadata } from '../metadata';
// import { RecursiveAngularExpressionVisitor } from './recursiveAngularExpressionVisitor';
// import { SourceMappingVisitor } from '../sourceMappingVisitor';
//
// const getExpressionDisplacement: Function = (binding: ast.TemplateAst): number => {
//     let totalLength: number = 0;
//     let attrLen: number = 0;
//     let valLen: number = 0;
//     let result: number = 0;
//     if (
//         binding instanceof ast.BoundEventAst ||
//         binding instanceof ast.BoundElementPropertyAst ||
//         binding instanceof ast.BoundDirectivePropertyAst
//     ) {
//         // subBindingLen is for [class.foo], [style.foo], the length of
//         // the binding type. For event it is 0. (+1 because of the ".")
//         let subBindingLen: number = 0;
//         if (binding instanceof ast.BoundElementPropertyAst) {
//             // The length of the binding type
//             // tslint:disable-next-line:switch-default
//             switch (binding.type) {
//                 case ast.PropertyBindingType.Animation:
//                     subBindingLen = 'animate'.length + 1;
//                     break;
//                 case ast.PropertyBindingType.Attribute:
//                     subBindingLen = 'attr'.length + 1;
//                     break;
//                 case ast.PropertyBindingType.Class:
//                     subBindingLen = 'class'.length + 1;
//                     break;
//                 case ast.PropertyBindingType.Style:
//                     subBindingLen = 'style'.length + 1;
//                     break;
//             }
//         }
//         // For [class.foo]=":
//         // - Add the name of the binding (binding.name.length).
//         // - 4 characters because of []=" (we already have the "." from above).
//         // - subBindingLen is from above and applies only for elements.
//         if (!(binding instanceof ast.BoundDirectivePropertyAst)) {
//             attrLen = binding.name.length + 4 + subBindingLen;
//         }
//
//         // Total length of the attribute value
//         if (binding instanceof ast.BoundEventAst) {
//             valLen = binding.handler.span.end;
//         } else if (
//             binding instanceof ast.BoundDirectivePropertyAst &&
//             (binding.templateName === 'ngForOf' || binding.templateName === 'ngIf')
//         ) {
//             // Handling everything except [ngForOf] differently
//             // [ngForOf] and [ngIf] require different logic because it gets desugered
//             result = binding.sourceSpan.start.file.content.lastIndexOf((binding.value as any).source);
//
//             if (binding.templateName === 'ngIf') {
//                 if ((binding.value as any).ast.span.start > 0) {
//                     result = binding.sourceSpan.start.file.content.lastIndexOf((binding.value as any).source) + (binding.value as any).ast.span.start;
//                 }
//             }
//         } else {
//             valLen = binding.value.span.end;
//         }
//
//         // Handling everything except [ngForOf]
//         if (!(binding instanceof ast.BoundDirectivePropertyAst) || (binding.templateName !== 'ngForOf' && binding.templateName !== 'ngIf')) {
//             // Total length of the entire part of the template AST corresponding to this AST.
//             totalLength = binding.sourceSpan.end.offset - binding.sourceSpan.start.offset;
//             // The whitespace are possible only in:
//             // `[foo.bar]          =         "...."`,
//             // and they are everything except the attrLen and the valLen (-1 because of the close quote).
//             const whitespace: number = totalLength - (attrLen + valLen) - 1;
//             // The resulted displacement is the length of the attribute + the whitespaces which
//             // can be located ONLY before the value (the binding).
//             result = whitespace + attrLen + binding.sourceSpan.start.offset;
//         }
//     } else if (binding instanceof ast.BoundTextAst) {
//         result = binding.sourceSpan.start.offset;
//     }
//     return result;
// };
//
// // tslint:disable-next-line:interface-name
// export interface RecursiveAngularExpressionVisitorCtr {
//     // @ts-ignore
//     new (sourceFile: ts.SourceFile, options: Lint.IOptions, context: ComponentMetadata, basePosition: number);
// }
//
// // tslint:disable-next-line:interface-name
// export interface TemplateAstVisitorCtr {
//     // @ts-ignore
//     new (
//         sourceFile: ts.SourceFile,
//         options: Lint.IOptions,
//         context: ComponentMetadata,
//         templateStart: number,
//         expressionVisitorCtrl: RecursiveAngularExpressionVisitorCtr
//     );
// }
//
// export class BasicTemplateAstVisitor extends SourceMappingVisitor implements ast.TemplateAstVisitor {
//     // tslint:disable-next-line:typedef
//     private _variables = {};
//
//     constructor(
//         sourceFile: ts.SourceFile,
//         private _originalOptions: Lint.IOptions,
//         protected context: ComponentMetadata,
//         protected templateStart: number,
//         private expressionVisitorCtrl: RecursiveAngularExpressionVisitorCtr = RecursiveAngularExpressionVisitor
//     ) {
//         super(sourceFile, _originalOptions, context.template!.template, templateStart);
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visit?(node: ast.TemplateAst, context: any): any {
//         node.visit(this, context);
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitNgContent(ast: ast.NgContentAst, context: any): any {}
//     // tslint:disable-next-line:no-any typedef
//     public visitEmbeddedTemplate(ast: ast.EmbeddedTemplateAst, context: any): any {
//         ast.directives.forEach(d => this.visit!(d, context));
//         ast.variables.forEach(v => this.visit!(v, context));
//         ast.children.forEach(e => this.visit!(e, context));
//         ast.outputs.forEach(o => this.visit!(o, context));
//         ast.attrs.forEach(a => this.visit!(a, context));
//         ast.references.forEach(r => this.visit!(r, context));
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitElement(element: ast.ElementAst, context: any): any {
//         element.references.forEach(r => this.visit!(r, context));
//         element.inputs.forEach(i => this.visit!(i, context));
//         element.outputs.forEach(o => this.visit!(o, context));
//         element.attrs.forEach(a => this.visit!(a, context));
//         element.children.forEach(e => this.visit!(e, context));
//         element.directives.forEach(d => this.visit!(d, context));
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitReference(ast: ast.ReferenceAst, context: any): any {}
//     // tslint:disable-next-line:no-any typedef
//     public visitVariable(ast: ast.VariableAst, context: any): any {
//         this._variables[ast.name] = true;
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitEvent(ast: ast.BoundEventAst, context: any): any {
//         this._variables['$event'] = true;
//         this.visitNgTemplateAST(ast.handler, this.templateStart + getExpressionDisplacement(ast));
//         this._variables['$event'] = false;
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitElementProperty(prop: ast.BoundElementPropertyAst, context: any): any {
//         const ast = (prop.value as e.ASTWithSource).ast;
//         (ast as any).interpolateExpression = (prop.value as any).source;
//         this.visitNgTemplateAST(prop.value, this.templateStart + getExpressionDisplacement(prop), prop);
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitAttr(ast: ast.AttrAst, context: any): any {}
//     // tslint:disable-next-line:no-any typedef
//     public visitBoundText(text: ast.BoundTextAst, context: any): any {
//         if (ExpTypes.ASTWithSource(text.value)) {
//             // Note that will not be reliable for different interpolation symbols
//             const ast = (text.value as e.ASTWithSource).ast;
//             (ast as any).interpolateExpression = (text.value as any).source;
//             this.visitNgTemplateAST(ast, this.templateStart + getExpressionDisplacement(text));
//         }
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitText(text: ast.TextAst, context: any): any {}
//     // tslint:disable-next-line:no-any typedef
//     public visitDirective(ast: ast.DirectiveAst, context: any): any {
//         ast.inputs.forEach(o => this.visit!(o, context));
//         ast.hostProperties.forEach(p => this.visit!(p, context));
//         ast.hostEvents.forEach(e => this.visit!(e, context));
//     }
//     // tslint:disable-next-line:no-any typedef
//     public visitDirectiveProperty(prop: ast.BoundDirectivePropertyAst, context: any): any {
//         if (ExpTypes.ASTWithSource(prop.value)) {
//             this.visitNgTemplateAST(prop.value, this.templateStart + getExpressionDisplacement(prop), prop);
//         }
//     }
//
//     // tslint:disable-next-line:no-any typedef
//     protected visitNgTemplateAST(ast: e.AST, templateStart: number, prop?: any) {
//         // @ts-ignore
//         // tslint:disable-next-line:no-any
//         const templateVisitor: any = new this.expressionVisitorCtrl(this.getSourceFile(), this._originalOptions, this.context, templateStart);
//         templateVisitor.preDefinedVariables = this._variables;
//         templateVisitor.parentAST = prop;
//         templateVisitor.visit(ast);
//         // @ts-ignore
//         templateVisitor.getFailures().forEach(f => this.addFailure(f));
//     }
// }
