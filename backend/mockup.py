#! /usr/bin/python3
# -*- coding: utf-8 -*-

##############################################################################
#
# Copyright (C) Inifiniplex LTD. 2023.
#
# All rights reserved.
# This is a mockup for the primer design app. 
#
##############################################################################

import argparse
from distutils.command.config import config
import textwrap
import tomli

def get_arguments():
    parser = argparse.ArgumentParser(
        description='Generate the gblocks DB',
        formatter_class=argparse.RawTextHelpFormatter,
        epilog=textwrap.dedent('''\
            This is not the real scrip, this is a mockup.
        '''))

    # inputs
    parser.add_argument('--config-file',
                        dest="config_file",
                        help="Configuration file",
                        default="mockup.ini",
                        )

    # outputs
    parser.add_argument('--output-dir',
                        dest="output_dir",
                        default="diego",
                        help='Directory in which to save the data',
                        )
    return parser

################################
# main

parser = get_arguments()
args = parser.parse_args()

if args.config_file == None:
    print("Config file missing")
    exit(-1)

if args.output_dir == None:
    print("Output dir is missing")
    exit(-1)


def save_numbers(file_name: str, count: int) -> None:
    output_file = open( file_name,'w')
    i = 1
    for j in range(count):
        i += j
        output_file.write(f"{i},")

def save_name(file_name: str, name: str) -> None:
    output_file = open( file_name,'w')
    output_file.write(name)

# assumption is that the config file will look like this (values may change...):
# [general]
# magic_number=42
# my_name="slim shady"
with open(args.config_file, "rb") as f:
    toml_dict = tomli.load(f)
    magic_number = toml_dict["general"]["magic_number"]
    my_name = toml_dict["general"]["my_name"]


    save_numbers(f"{args.output_dir}/numbers.csv", magic_number)
    print('abc')
    save_name(f"{args.output_dir}/name.txt", my_name)
