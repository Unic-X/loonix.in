---
title : Loda Dijsaktra
---

Dijasktra

```rs
while not_visited.len() != 0 {
    if let Some((key, _)) = not_visited.iter().min() {
        curr=key;
    };          //Get the smallest distance node

    let neighbours: HashSet<&str> =
    HashSet::from_iter(parsed.get(curr).unwrap().connecting.iter().copied());  //Create a hashset of neighbours from the connecting nodes of current
    for neighbour in not_visited                //Visit those nodes that are not visited
        .keys()
        .cloned()
        .collect::<HashSet<&str>>()
        .intersection(&neighbours)

    {       
            let alt = not_visited.get(curr).unwrap()+1;
            println!("Current node is {} \n neighbour currently looking is {} \n distance is {}",&curr,&neighbour,&alt);
                
            println!("Distance set is {}",*not_visited.get(neighbour).unwrap());

            if alt < *not_visited.get(neighbour).unwrap(){
                not_visited.insert(&neighbour, alt);
                visited.insert(&neighbour, *not_visited.get(neighbour).unwrap());


            }
    }
    not_visited.remove(curr);      //Remove the current smallest node that is.   


}
```