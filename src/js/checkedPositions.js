export default function checkedPositions(position, distance, size) {
  const values = [];
  const indexRow = Math.floor(position / size);
  const indexColumn = position % size;

  for (let i = 1; i <= distance; i += 1) {
    if (indexColumn + i < size) {
      values.push(indexRow * size + (indexColumn + i));
    }
    if (indexColumn - i >= 0) {
      values.push(indexRow * size + (indexColumn - i));
    }
    if (indexRow + i < size) {
      values.push((indexRow + i) * size + indexColumn);
    }
    if (indexRow - i >= 0) {
      values.push((indexRow - i) * size + indexColumn);
    }
    if (indexRow + i < size && indexColumn + i < size) {
      values.push((indexRow + i) * size + (indexColumn + i));
    }
    if (indexRow - i >= 0 && indexColumn - i >= 0) {
      values.push((indexRow - i) * size + (indexColumn - i));
    }
    if (indexRow + i < size && indexColumn - i >= 0) {
      values.push((indexRow + i) * size + (indexColumn - i));
    }
    if (indexRow - i >= 0 && indexColumn + i < size) {
      values.push((indexRow - i) * size + (indexColumn + i));
    }
  }
  return values;
}
