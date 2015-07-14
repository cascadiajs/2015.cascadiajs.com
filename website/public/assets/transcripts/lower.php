<?php

foreach(glob('*') as $filename) {
    $newname = strtolower($filename);
    $newname = str_replace('150708 ', '', $newname);
    $newname = str_replace('150709-', '', $newname);
    $newname = str_replace('150710-', '', $newname);
    $newname = str_replace('cascadiafest - ', '', $newname);
    $newname = str_replace(' ', '-', $newname);

    rename($filename, $newname);
}