import Graph from "./graph.js";

document.getElementById("newinput").addEventListener("click", () => {
  document.getElementById("inputField").innerHTML += `
  <div class='form'><span> y : </span> <input type="text" placeholder="enter your expression"></div>
  `;
});
document.getElementById("deleteinput").addEventListener("click", () => {
  let x = document.querySelectorAll("#inputField > .form");
  x[x.length - 1].remove();
});

let eqn = "((x+2)^5) + 10x";

const cleanEqn = (eqn) => {
  for (let i = 1; i < eqn.length; i++) {
    if (eqn[i] === " ") {
      eqn = eqn.slice(0, i) + eqn.slice(i + 1);
      i--;
    }
  }
  return eqn;
};

console.log(eqn);
//returns a calculator func for the eqn
const termSplitter = (eqn) => {
  eqn = "+" + eqn + "+";
  // console.log("initial : ", eqn);
  let terms = []; // A function for every term of the eqn
  let initial = 0;
  for (let i = 1; i < eqn.length; i++) {
    let apy = eqn.substring(initial, i);
    if (eqn[i] === "+" || eqn[i] === "-") {
      let eq = eqn.substring(initial, i);
      if (!eq.includes("log") && !eq.includes("sin") && !eq.includes("cos")) {
        if (eq.indexOf("(") === -1 && eq.indexOf("^") === -1) {
          //! OUTSIDE BRACKET
          // console.log("1 func");
          // console.log("eq : ", eq);

          if (eq.indexOf("x") === -1) {
            //! CONSTANT TERM

            // console.log("initial : ", initial);
            // console.log("eq", eq);
            let newF = (x) => Number(eq);
            let m = newF();
            // debugger;
            terms.push(newF);
          } else {
            terms.push(termGenerator(eq));
          }

          initial = i;
        } else if (eq.indexOf("^") !== -1 && eq.indexOf("(") === -1) {
          //! POW(^) TERM WITHOUT ANY BRACKET
          // console.log("2 func");
          let eqnCopy = eq.substring(1);
          let pt1 = eqnCopy.split("^")[0];
          let pt2 = eqnCopy.split("^")[1];
          let newF = newPowCreator(pt1, pt2);
          terms.push(newF);
        } else {
          // console.log("3 func");
          // debugger;
          //! WHEN THERE IS A BRACKET
          let eqnCopy = eqn.substring(initial);
          let str2;
          for (let j = eqnCopy.indexOf("(") + 1; j < eqnCopy.length; j++) {
            let str = eqnCopy.substring(eqnCopy.indexOf("("), j);
            if (
              str.replace(/[^(]/g, "").length ===
              str.replace(/[^)]/g, "").length
            ) {
              // console.log("str", str);
              if (str.indexOf("^") !== -1 && str.indexOf("(") !== -1) {
                let pt1 = str.split("^")[0].substring(1);
                let pt2 = str
                  .split("^")[1]
                  .substring(0, str.split("^")[1].length - 1);
                let newF = newPowCreator(pt1, pt2);
                // console.log(newF(2));
                terms.push(newF);
                initial += j;
                i = initial;
                j = eqnCopy.length;
                // debugger;
              } else {
                // console.log("str", str);
                // console.log("ini1", initial);
                // debugger;
                initial += j + 1;
                // console.log("ini2", initial);
                i = initial;
                str2 = eqnCopy.substring(eqnCopy.indexOf("(") + 1, j - 1);
                j = eqnCopy.length;
                let mult = Number(eqnCopy.substring(1, eqnCopy.indexOf("(")));
                if (mult === 0) terms.push(newTermCreator(str2, (x) => x, 1));
                else terms.push(newTermCreator(str2, (x) => x, mult));
              }
            }
          }
        }
      } else if (
        eq.includes("log") ||
        eq.includes("sin") ||
        eq.includes("cos")
      ) {
        let eqnCopy = eqn.substring(initial);
        let str2, i0;
        for (let j = eqnCopy.indexOf("(") + 1; j < eqnCopy.length; j++) {
          let str = eqnCopy.substring(eqnCopy.indexOf("("), j);
          // console.log("str", str);
          if (
            str.replace(/[^(]/g, "").length === str.replace(/[^)]/g, "").length
          ) {
            // console.log("str", str);
            // console.log("ini1", initial);
            initial += j;
            // console.log("ini2", initial);
            i = initial;
            str2 = eqnCopy.substring(eqnCopy.indexOf("(") + 1, j - 1);
            j = eqnCopy.length;
          }
        }
        // console.log("str2 : ", str2);
        // console.log("**************************");
        if (eq.includes("log")) {
          let mult = Number(eqnCopy.substring(1, eqnCopy.indexOf("l")));
          if (mult === 0) terms.push(newTermCreator(str2, Math.log, 1));
          else terms.push(newTermCreator(str2, Math.cos, mult));
        }
        if (eq.includes("sin")) {
          let mult = Number(eqnCopy.substring(1, eqnCopy.indexOf("s")));
          if (mult === 0) terms.push(newTermCreator(str2, Math.sin, 1));
          else terms.push(newTermCreator(str2, Math.cos, mult));
        }
        if (eq.includes("cos")) {
          if (eqnCopy[0] !== "+" || eqnCopy[0] !== "-") eqnCopy = "+" + eqnCopy;
          let mult = Number(eqnCopy.substring(1, eqnCopy.indexOf("c")));
          if (mult === 0) terms.push(newTermCreator(str2, Math.cos, 1));
          else terms.push(newTermCreator(str2, Math.cos, mult));
        }
      }
    }
  }
  console.log(terms.length, " : ", eqn);
  let finalterm = (a) => {
    let ans = 0;
    terms.forEach((term) => {
      ans += term(a);
    });
    return ans;
  };
  console.log("done");
  return finalterm;
};

const termGenerator = (exp) => {
  // if (exp === "+10x") debugger;
  //first char shd be + or -
  if (exp[0] !== "+" && exp[0] !== "-") exp = "+" + exp;
  let x = {};
  x.operation = exp[0];
  exp = exp.substring(1);
  if (exp.length === 1) x.mult = 1;
  else if (exp.indexOf("x") === exp.length - 1) {
    x.mult = Number(exp.slice(0, exp.length - 1));
  } else {
    x.mult =
      Number(exp.slice(0, exp.indexOf("x"))) *
      Number(exp.slice(exp.indexOf("x") + 1), exp.length - 1);
  }
  x.data = dataCreator(x);
  let term = findEvaluate(x);
  // if (exp === "10x") console.log("hi", term(5));
  return term;
};

const dataCreator = (obj) => {
  let data;
  if (obj.operation === "+") {
    data = (x) => {
      return obj.mult * x;
    };
  } else if (obj.operation === "") {
    data = (x) => {
      return obj.mult * x * -1;
    };
  }
  return data;
};

const findEvaluate = (obj) => {
  let evalFunc = (x) => {
    return obj.data(x);
  };
  return evalFunc;
};

const newTermCreator = (exp, a, m) => {
  let i = termSplitter(exp);
  // let b = i(1);
  // console.log(a(2));
  let j = (x) => {
    let p = m * a(i(x));
    return p;
  };
  return j;
};

const newPowCreator = (pt1, pt2) => {
  // console.log(pt1);
  let ptf1 = termSplitter(pt1);
  let ptf2 = termSplitter(pt2);
  // console.log(ptf1(1));
  // console.log(ptf2(1));
  let j = (x) => {
    let p = Math.pow(ptf1(x), ptf2(x));
    return p;
  };
  // console.log(j(2));
  // debugger;
  return j;
};

// cleanEqn(eqn);
// let x = termSplitter(eqn);
// console.log(x(1));

// myGraph.drawEquation(
//   function (x) {
//     return 5 * Math.cos(x);
//   },
//   "green",
//   3
// );

document.getElementById("create").addEventListener("click", () => {
  let m = document.querySelectorAll("#inputField > .form > input");
  let expressionsInput = [];
  m.forEach((x) => {
    expressionsInput.push(x.value);
  });
  let zoom = Number(document.getElementById("myRange").value);
  let canvas = document.getElementById("myCanvas");
  let context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < expressionsInput.length; i++) {
    expressionsInput[i] = cleanEqn(expressionsInput[i]);
  }
  console.log(expressionsInput);
  let equations = [];
  expressionsInput.forEach((exp) => {
    let a = termSplitter(exp);
    equations.push(a);
  });
  let m2 = zoom * 10;
  let myGraph = new Graph({
    canvasId: "myCanvas",
    minX: -m2,
    minY: -m2,
    maxX: m2,
    maxY: m2,
    unitsPerTick: zoom,
  });

  equations.forEach((exp) => {
    myGraph.drawEquation((x) => exp(x), "black", 3);
  });
});
