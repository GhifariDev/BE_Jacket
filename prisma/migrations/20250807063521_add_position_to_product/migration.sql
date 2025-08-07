ALTER TABLE `Product` ADD COLUMN `position` INTEGER;

SET @pos = 0;
UPDATE Product SET position = (@pos := @pos + 1) ORDER BY id;
