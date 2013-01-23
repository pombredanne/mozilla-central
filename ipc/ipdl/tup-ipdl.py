# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

import optparse, os, re, sys
from cStringIO import StringIO

import ipdl

def log(minv, fmt, *args):
    if _verbosity >= minv:
        print fmt % args

# process command line

op = optparse.OptionParser(usage='tup-ipdl.py [options] IPDLfiles...')
op.add_option('-I', '--include', dest='includedirs', default=[ ],
              action='append',
              help='Additional directory to search for included protocol specifications')
op.add_option('-v', '--verbose', dest='verbosity', default=1, action='count',
              help='Verbose logging (specify -vv or -vvv for very verbose logging)')
op.add_option('-q', '--quiet', dest='verbosity', action='store_const', const=0,
              help="Suppress logging output")

options, files = op.parse_args()
_verbosity = options.verbosity
includedirs = [ os.path.abspath(incdir) for incdir in options.includedirs ]

if not len(files):
    op.error("No IPDL files specified")

allprotocols = []

def normalizedFilename(f):
    if f == '-':
        return '<stdin>'
    return f

# First pass: parse and type-check all protocols
for f in files:
    log(2, os.path.basename(f))
    filename = normalizedFilename(f)
    if f == '-':
        fd = sys.stdin
    else:
        fd = open(f)

    specstring = fd.read()
    fd.close()

    ast = ipdl.parse(specstring, filename, includedirs=includedirs)
    if ast is None:
        print >>sys.stderr, 'Specification could not be parsed.'
        sys.exit(1)

    log(2, 'checking types')
    if not ipdl.typecheck(ast):
        print >>sys.stderr, 'Specification is not well typed.'
        sys.exit(1)

    if _verbosity > 2:
        log(3, '  pretty printed code:')
        ipdl.genipdl(ast, codedir)

# Second pass: generate code
for f in files:
    # Read from parser cache
    filename = normalizedFilename(f)
    ast = ipdl.parse(None, filename, includedirs=includedirs)
    ipdl.gencxx(filename, ast, '.', '.', tup_support=True)

    if ast.protocol:
        allprotocols.append('%sMsgStart' % ast.protocol.name)


allprotocols.sort()

ipcmsgstart = StringIO()

print >>ipcmsgstart, """
// CODE GENERATED by tup-ipdl.py. Do not edit.

#ifndef IPCMessageStart_h
#define IPCMessageStart_h

enum IPCMessageStart {
"""

for name in allprotocols:
    print >>ipcmsgstart, "  %s," % name

print >>ipcmsgstart, """
  LastMsgIndex
};

COMPILE_ASSERT(LastMsgIndex <= 65536, need_to_update_IPC_MESSAGE_MACRO);

#endif // ifndef IPCMessageStart_h
"""

ipdl.write_tup(ipcmsgstart.getvalue(), 'IPCMessageStart.h')
