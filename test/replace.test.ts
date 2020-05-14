import chai from "chai";
import { IdentifierExpression } from "shift-ast";
import { parseScript as parse } from "shift-parser";
import { RefactorSession } from "../src/index";


describe("replace", function() {
  it("should replace statements", () => {
    let ast = parse(`function foo(){}\nfoo();`);
    const refactor = new RefactorSession(ast);
    refactor.replace(`FunctionDeclaration[name.name="foo"]`, `console.log(0)`);
    chai.expect(refactor.ast).to.deep.equal(parse("console.log(0);foo();"));
  });
  it("should replace expressions", () => {
    let ast = parse(`foo(a)`);
    const refactor = new RefactorSession(ast);
    refactor.replace(`IdentifierExpression[name="a"]`, `bar()`);
    chai.expect(refactor.ast).to.deep.equal(parse("foo(bar())"));
  });
  it("should accept a node list as a replacement", () => {
    let ast = parse(`foo(a)`);
    const refactor = new RefactorSession(ast);
    const callExpressions = refactor.query('CallExpression');
    refactor.replace(callExpressions, "`foo`");
    chai.expect(refactor.ast).to.deep.equal(parse("`foo`"));
  });
  it("should be able to pass a function in to replace", () => {
    let ast = parse(`foo(a)`);
    const refactor = new RefactorSession(ast);
    refactor.replace(
      `IdentifierExpression[name="a"]`,
      (      node: { name: string; }) => new IdentifierExpression({ name: node.name + "b" })
    );
    chai.expect(refactor.ast).to.deep.equal(parse("foo(ab)"));
  });
  it("should accept source containing a lone string from a passed function (catch directive case)", () => {
    let ast = parse(`foo(a)`);
    const refactor = new RefactorSession(ast);
    refactor.replace(
      `IdentifierExpression[name="a"]`,
      (      node: { name: any; }) => `"${node.name}"`
    );
    chai.expect(refactor.ast).to.deep.equal(parse("foo('a')"));
  });
  it("should accept raw source from a passed function to replace expressions", () => {
    let ast = parse(`foo(a)`);
    const refactor = new RefactorSession(ast);
    refactor.replace(
      `IdentifierExpression[name="a"]`,
      (      node: any) => `true`
    );
    chai.expect(refactor.ast).to.deep.equal(parse("foo(true)"));
  });
  it("should accept raw source from a passed function to replace statements", () => {
    let ast = parse(`a;foo(a);b;`);
    const refactor = new RefactorSession(ast);
    refactor.replace(
      `ExpressionStatement[expression.type="CallExpression"]`,
      (      node: any) => `console.log(test)`
    );
    chai.expect(refactor.ast).to.deep.equal(parse("a;console.log(test);b;"));
  });
});
