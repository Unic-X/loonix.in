---
title : Bhess-Engine
description: Chess-Engine written using bitboards way!
img: bhess.jpg
tags:
    - rust

date : 2023-12-16
---
Source code at [Github](https://github.com/Unic-X/Bhess-Engine)

### Current Development Status:
1. Bitboard [X]
1. Piece Masking [x]
1. Move Generation [x]
1. Magic Numbers [x] 
1. Parsing FEN Strings [ ]
1. Perft Driver Functions [ ]
1. Evaluation [ ]
1. Quiescence Search [ ] 

### Bitboard:

- #### Why
    Bitboards are currently the fastest way for representing a board state. Since it only uses one instruction 
    per operation on a 64-bit CPUs.

- #### Memory:
    The second reason to use BitBoards is that they are the most efficient way to store a board, which becomes relevant for the search in chess engines, since many boards are in memory during search.

- #### What is it anyway?


