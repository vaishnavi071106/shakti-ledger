// Simple LessThan template for our credit proof
template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component num2Bits1 = Num2Bits(n);
    component num2Bits2 = Num2Bits(n);

    num2Bits1.in <== in[0] + (1<<n) - in[1];
    num2Bits2.in <== (1<<n) - in[1];

    out <== num2Bits1.out[n];
}

template Num2Bits(n) {
    signal input in;
    signal output out[n];
    var lc1=0;

    for (var i = 0; i<n; i++) {
        out[i] <-- (in >> i) & 1;
        out[i] * (out[i] -1 ) === 0;
        lc1 += out[i] * 2**i;
    }

    lc1 === in;
}

template creditProof() {
    signal private input score; 
    signal input threshold;

    component lt = LessThan(32);
    lt.in[0] <== threshold;
    lt.in[1] <== score;

    lt.out === 1;
}

component main = creditProof();
