/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef, ɵstringify as stringify} from '@angular/core';


/**
 * A structural directive that conditionally includes a template based on the value of
 * an expression coerced to Boolean.
 * When the expression evaluates to true, Angular renders the template
 * provided in a `then` clause, and when  false or null,
 * Angular renders the template provided in an optional `else` clause. The default
 * template for the `else` clause is blank.
 *
 * A [shorthand form](guide/structural-directives#the-asterisk--prefix) of the directive,
 * `*ngIf="condition"`, is generally used, provided
 * as an attribute of the anchor element for the inserted template.
 * Angular expands this into a more explicit version, in which the anchor element
 * is contained in an `<ng-template>` element.
 *
 * Simple form with shorthand syntax:
 *
 * ```
 * <div *ngIf="condition">Content to render when condition is true.</div>
 * ```
 *
 * Simple form with expanded syntax:
 *
 * ```
 * <ng-template [ngIf]="condition"><div>Content to render when condition is
 * true.</div></ng-template>
 * ```
 *
 * Form with an "else" block:
 *
 * ```
 * <div *ngIf="condition; else elseBlock">Content to render when condition is true.</div>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Shorthand form with "then" and "else" blocks:
 *
 * ```
 * <div *ngIf="condition; then thenBlock else elseBlock"></div>
 * <ng-template #thenBlock>Content to render when condition is true.</ng-template>
 * <ng-template #elseBlock>Content to render when condition is false.</ng-template>
 * ```
 *
 * Form with storing the value locally:
 *
 * ```
 * <div *ngIf="condition as value; else elseBlock">{{value}}</div>
 * <ng-template #elseBlock>Content to render when value is null.</ng-template>
 * ```
 *
 * Form with reuse view strategy:
 *
 * ```
 * <div *ngIf="condition; else elseBlock; reuse 'reuse'">Content to render when condition is true
 * without destroying when re-activated.</div>
 * <ng-template #elseBlock>Content to render when condition is false without destroying when
 * re-activated.</ng-template>
 * ```
 *
 * @usageNotes
 *
 * The `*ngIf` directive is most commonly used to conditionally show an inline template,
 * as seen in the following  example.
 * The default `else` template is blank.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfSimple'}
 *
 * ### Showing an alternative template using `else`
 *
 * To display a template when `expression` evaluates to false, use an `else` template
 * binding as shown in the following example.
 * The `else` binding points to an `<ng-template>`  element labeled `#elseBlock`.
 * The template can be defined anywhere in the component view, but is typically placed right after
 * `ngIf` for readability.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfElse'}
 *
 * ### Using an external `then` template
 *
 * In the previous example, the then-clause template is specified inline, as the content of the
 * tag that contains the `ngIf` directive. You can also specify a template that is defined
 * externally, by referencing a labeled `<ng-template>` element. When you do this, you can
 * change which template to use at runtime, as shown in the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfThenElse'}
 *
 * ### Storing a conditional result in a variable
 *
 * You might want to show a set of properties from the same object. If you are waiting
 * for asynchronous data, the object can be undefined.
 * In this case, you can use `ngIf` and store the result of the condition in a local
 * variable as shown in the the following example.
 *
 * {@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * This code uses only one `AsyncPipe`, so only one subscription is created.
 * The conditional statement stores the result of `userStream|async` in the local variable `user`.
 * You can then bind the local `user` repeatedly.
 *
 * The conditional displays the data only if `userStream` returns a value,
 * so you don't need to use the
 * [safe-navigation-operator](guide/template-syntax#safe-navigation-operator) (`?.`)
 * to guard against null values when accessing properties.
 * You can display an alternative template while waiting for the data.
 *
 * ### Shorthand syntax
 *
 * The shorthand syntax `*ngIf` expands into two separate template specifications
 * for the "then" and "else" clauses. For example, consider the following shorthand statement,
 * that is meant to show a loading page while waiting for data to be loaded.
 *
 * ```
 * <div class="hero-list" *ngIf="heroes else loading">
 *  ...
 * </div>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * You can see that the "else" clause references the `<ng-template>`
 * with the `#loading` label, and the template for the "then" clause
 * is provided as the content of the anchor element.
 *
 * However, when Angular expands the shorthand syntax, it creates
 * another `<ng-template>` tag, with `ngIf` and `ngIfElse` directives.
 * The anchor element containing the template for the "then" clause becomes
 * the content of this unlabeled `<ng-template>` tag.
 *
 * ```
 * <ng-template [ngIf]="hero-list" [ngIfElse]="loading">
 *  <div class="hero-list">
 *   ...
 *  </div>
 * </ng-template>
 *
 * <ng-template #loading>
 *  <div>Loading...</div>
 * </ng-template>
 * ```
 *
 * The presence of the implicit template object has implications for the nesting of
 * structural directives. For more on this subject, see
 * [Structural Directives](https://angular.io/guide/structural-directives#one-per-element).
 *
 * @ngModule CommonModule
 * @publicApi
 */
@Directive({selector: '[ngIf]'})
export class NgIf {
  private _context: NgIfContext = new NgIfContext();
  private _thenTemplateRef: TemplateRef<NgIfContext>|null = null;
  private _elseTemplateRef: TemplateRef<NgIfContext>|null = null;
  private _thenViewRef: EmbeddedViewRef<NgIfContext>|null = null;
  private _elseViewRef: EmbeddedViewRef<NgIfContext>|null = null;
  private _viewReuseStrategy: ViewReuseStrategy = this.computeViewReuseStrategy('recreate');

  constructor(private _viewContainer: ViewContainerRef, templateRef: TemplateRef<NgIfContext>) {
    this._thenTemplateRef = templateRef;
  }

  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   */
  @Input()
  set ngIf(condition: any) {
    this._context.$implicit = this._context.ngIf = condition;
    this._updateView();
  }

  /**
   * A template to show if the condition expression evaluates to true.
   */
  @Input()
  set ngIfThen(templateRef: TemplateRef<NgIfContext>|null) {
    assertTemplate('ngIfThen', templateRef);
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * A template to show if the condition expression evaluates to false.
   */
  @Input()
  set ngIfElse(templateRef: TemplateRef<NgIfContext>|null) {
    assertTemplate('ngIfElse', templateRef);
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * Provides a way to customize when activated views get reused.
   */
  @Input()
  set ngIfReuse(viewReuseStrategy: 'reuse'|'recreate') {
    this._viewReuseStrategy = this.computeViewReuseStrategy(viewReuseStrategy);
    this._updateView();
  }

  private _updateView() {
    if (this._context.$implicit) {
      if (!this.viewActivated(this._thenViewRef)) {
        this._viewReuseStrategy.detach(this._viewContainer);
        if (this._thenTemplateRef) {
          this._thenViewRef = this._viewReuseStrategy.attach(
              this._viewContainer, this._thenViewRef, this._thenTemplateRef, this._context);
        }
      }
    } else {
      if (!this.viewActivated(this._elseViewRef)) {
        this._viewReuseStrategy.detach(this._viewContainer);
        if (this._elseTemplateRef) {
          this._elseViewRef = this._viewReuseStrategy.attach(
              this._viewContainer, this._elseViewRef, this._elseTemplateRef, this._context);
        }
      }
    }
  }

  private viewActivated(embeddedViewRef: EmbeddedViewRef<NgIfContext>|null): boolean {
    if (!embeddedViewRef) {
      return false;
    }

    return this._viewContainer.indexOf(embeddedViewRef) !== -1;
  }

  private computeViewReuseStrategy(viewReuseStrategy: 'reuse'|'recreate'): ViewReuseStrategy {
    if (viewReuseStrategy === 'reuse') {
      return _restateViewStrategy;
    }

    return _recreateViewStrategy;
  }

  /** @internal */
  public static ngIfUseIfTypeGuard: void;

  /**
   * Assert the correct type of the expression bound to the `ngIf` input within the template.
   *
   * The presence of this method is a signal to the Ivy template type check compiler that when the
   * `NgIf` structural directive renders its template, the type of the expression bound to `ngIf`
   * should be narrowed in some way. For `NgIf`, it is narrowed to be non-null, which allows the
   * strictNullChecks feature of TypeScript to work with `NgIf`.
   */
  static ngTemplateGuard_ngIf<E>(dir: NgIf, expr: E): expr is NonNullable<E> { return true; }
}

/**
 * @publicApi
 */
export class NgIfContext {
  public $implicit: any = null;
  public ngIf: any = null;
}

interface ViewReuseStrategy {
  attach(
      viewContainer: ViewContainerRef, viewRef: EmbeddedViewRef<NgIfContext>|null,
      templateRef: TemplateRef<NgIfContext>, context: NgIfContext): EmbeddedViewRef<NgIfContext>;
  detach(viewContainer: ViewContainerRef): void;
}

class RecreateViewStrategy implements ViewReuseStrategy {
  attach(
      viewContainer: ViewContainerRef, viewRef: EmbeddedViewRef<NgIfContext>|null,
      templateRef: TemplateRef<NgIfContext>, context: NgIfContext): EmbeddedViewRef<NgIfContext> {
    return viewContainer.createEmbeddedView(templateRef, context);
  }

  detach(viewContainer: ViewContainerRef): void { viewContainer.clear(); }
}

class RestateViewStrategy implements ViewReuseStrategy {
  attach(
      viewContainer: ViewContainerRef, viewRef: EmbeddedViewRef<NgIfContext>|null,
      templateRef: TemplateRef<NgIfContext>, context: NgIfContext): EmbeddedViewRef<NgIfContext> {
    if (!viewRef) {
      viewRef = templateRef.createEmbeddedView(context);
    }

    viewContainer.insert(viewRef);

    return viewRef;
  }

  detach(viewContainer: ViewContainerRef): void { viewContainer.detach(); }
}

const _recreateViewStrategy = new RecreateViewStrategy();
const _restateViewStrategy = new RestateViewStrategy();

function assertTemplate(property: string, templateRef: TemplateRef<any>| null): void {
  const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
  if (!isTemplateRefOrNull) {
    throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
  }
}
