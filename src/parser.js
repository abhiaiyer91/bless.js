/**
 * Created by abhiaiyer on 3/11/15.
 */
var SELECTOR_LIMIT, createAst, css, parser;

css = require('css');

SELECTOR_LIMIT = 4095;

createAst = function(rules) {
    return {
        type: 'stylesheet',
        stylesheet: {
            rules: rules
        }
    };
};

parser = function(data) {
    var ast, nestedRule, newAsts, newData, numNestedRuleSelectors, numSelectors, rule, startNewAst, totalNumSelectors, traversedRules, _i, _j, _len, _len1, _ref, _ref1;
    ast = css.parse(data);
    numSelectors = 0;
    totalNumSelectors = 0;
    traversedRules = [];
    newAsts = [];
    startNewAst = function() {
        newAsts.push(createAst(traversedRules));
        traversedRules = [];
        return numSelectors = 0;
    };
    _ref = ast.stylesheet.rules;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rule = _ref[_i];
        switch (rule.type) {
            case 'rule':
                if (numSelectors + rule.selectors.length > SELECTOR_LIMIT) {
                    startNewAst();
                }
                numSelectors += rule.selectors.length;
                totalNumSelectors += rule.selectors.length;
                break;
            case 'comment':
                break;
            default:
                numNestedRuleSelectors = 0;
                if (typeof rule.rules !== 'undefined') {
                    _ref1 = rule.rules;
                    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                        nestedRule = _ref1[_j];
                        if (typeof nestedRule.selectors !== 'undefined') {
                            numNestedRuleSelectors += nestedRule.selectors.length;
                        }
                    }
                }
                if (numSelectors + numNestedRuleSelectors > SELECTOR_LIMIT) {
                    startNewAst();
                }
                numSelectors += numNestedRuleSelectors;
                totalNumSelectors += numNestedRuleSelectors;
        }
        traversedRules.push(rule);
        if (numSelectors === SELECTOR_LIMIT) {
            startNewAst();
        }
    }
    if (traversedRules.length) {
        newAsts.push(createAst(traversedRules));
    }
    newData = (function() {
        var _k, _len2, _results;
        _results = [];
        for (_k = 0, _len2 = newAsts.length; _k < _len2; _k++) {
            ast = newAsts[_k];
            _results.push(css.stringify(ast), {compress:true});
        }
        return _results;
    })();
    return {
        data: newData,
        numSelectors: totalNumSelectors
    };
};

module.exports = parser;
