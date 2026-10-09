export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DialogueTurn {
  speaker: string;
  role: string;
  avatar: string;
  text: string;
  isProfessor?: boolean;
}

export interface SlideScene {
  id: string;
  slideNumber: number;
  title: string;
  subtitle: string;
  takeaways: string[];
  codeOrDiagram?: string;
  realWorldIntuition: string;
  narrationScript: string;
  dialogue?: DialogueTurn[];
  quiz?: QuizQuestion;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  duration: string;
  tags: string[];
  professor: {
    name: string;
    role: string;
    avatar: string;
  };
  scenes: SlideScene[];
}

export const BOLO_CLASS_LESSONS: Lesson[] = [
  {
    "id": "java-data-types",
    "title": "Java Core: Data Types, JVM Memory & Type Casting",
    "subject": "Java Programming & JVM Architecture",
    "difficulty": "Foundational to Advanced",
    "duration": "25 mins",
    "tags": [
      "Java",
      "Data Types",
      "JVM Memory",
      "Primitives",
      "Type Casting"
    ],
    "professor": {
      "name": "Prof. Vyomra",
      "role": "Lead AI Professor of Computer Science & JVM Architecture",
      "avatar": "👨‍🏫"
    },
    "scenes": [
      {
        "id": "scene-java-1",
        "slideNumber": 1,
        "title": "Slide 1: Java Primitive Data Types & Byte Allocation",
        "subtitle": "The 8 primitive types, memory footprints, bit ranges, two's complement encoding, and default values.",
        "takeaways": [
          "Java defines 8 strict primitive types: byte (1B / 8-bit), short (2B / 16-bit), int (4B / 32-bit), long (8B / 64-bit), float (4B / IEEE 754), double (8B / IEEE 754), char (2B / UTF-16 Unicode), and boolean (1-bit logical).",
          "Primitives are stored directly within thread-local Stack Frames (Local Variable Array) with zero heap object header overhead, yielding sub-nanosecond L1/L2 CPU cache throughput.",
          "Deterministic Default Value Semantics: Instance and static fields initialize automatically to 0 (numeric), 0.0 (floating point), false (boolean), or \\u0000 (char); local method variables require explicit assignment.",
          "Two's Complement Integer Representation: All integral types (except char) are signed, mapping to ranges from -2^(N-1) to 2^(N-1)-1, eliminating dual-zero ambiguity in hardware ALUs.",
          "IEEE 754 Floating-Point Precision: `float` delivers 6–7 significant decimal digits of precision while `double` delivers 15–17 digits, mandating BigDecimal for exact financial and currency math."
        ],
        "codeOrDiagram": "public class JavaDataTypesDemo {\n    public static void main(String[] args) {\n        // Integral primitives with binary/hex formatting\n        byte smallCount = 127;                       // Range: -128 to 127\n        short port = 8080;                           // 16-bit signed\n        int userCount = 1_000_000;                   // Java 7+ underscore formatting\n        long epochMillis = 1711000000000L;           // Suffix 'L' required for 64-bit\n\n        // Floating point primitives (IEEE 754)\n        float piFloat = 3.1415927f;                  // Suffix 'f' required (32-bit)\n        double precision = 3.141592653589793;        // Default 64-bit precision\n\n        // Character and Boolean primitives\n        char unicodeLetter = '\\u0928';               // Devanagari 'Na' (16-bit Unicode)\n        char standardChar = 'A';                     // ASCII subset (UTF-16)\n        boolean isEnrolled = true;                   // JVM evaluates as 1\n\n        System.out.println(\"Stack Memory primitives allocated with zero GC footprint!\");\n    }\n}",
        "realWorldIntuition": "Java defines 8 strict primitive types: byte (1B / 8-bit), short (2B / 16-bit), int (4B / 32-bit), long (8B / 64-bit), float (4B / IEEE 754), double (8B / IEEE 754), char (2B / UTF-16 Unicode), and boolean (1-bit logical).",
        "narrationScript": "Slide 1: Java Primitive Data Types & Byte Allocation. The 8 primitive types, memory footprints, bit ranges, two's complement encoding, and default values. Key takeaways include: Java defines 8 strict primitive types: byte (1B / 8-bit), short (2B / 16-bit), int (4B / 32-bit), long (8B / 64-bit), float (4B / IEEE 754), double (8B / IEEE 754), char (2B / UTF-16 Unicode), and boolean (1-bit logical). Furthermore, Primitives are stored directly within thread-local Stack Frames (Local Variable Array) with zero heap object header overhead, yielding sub-nanosecond L1/L2 CPU cache throughput. Furthermore, Deterministic Default Value Semantics: Instance and static fields initialize automatically to 0 (numeric), 0.0 (floating point), false (boolean), or \\u0000 (char); local method variables require explicit assignment. Furthermore, Two's Complement Integer Representation: All integral types (except char) are signed, mapping to ranges from -2^(N-1) to 2^(N-1)-1, eliminating dual-zero ambiguity in hardware ALUs. Furthermore, IEEE 754 Floating-Point Precision: `float` delivers 6–7 significant decimal digits of precision while `double` delivers 15–17 digits, mandating BigDecimal for exact financial and currency math.",
        "dialogue": [
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Welcome scholars! In Java, data types are strictly split into two main families: Primitives and Reference types. Let us master the 8 primitives first.",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Professor, why does Java allocate 2 bytes (16 bits) for char when C only uses 1 byte (8 bits)?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Brilliant question, Alex! C used 8-bit ASCII which only supported 256 English symbols. Java was architected from day one for internationalization using 16-bit UTF-16 Unicode, enabling native support for Hindi, Telugu, Chinese, Arabic, and global emojis.",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "Which of the following is an 8-byte (64-bit) primitive data type in Java?",
          "options": [
            "long and double",
            "int and float",
            "short and char",
            "String and Integer"
          ],
          "correctIndex": 0,
          "explanation": "In Java, both `long` (64-bit integer) and `double` (64-bit IEEE 754 floating point) occupy exactly 8 bytes (64 bits) of memory."
        }
      },
      {
        "id": "scene-java-2",
        "slideNumber": 2,
        "title": "Slide 2: Reference Types, Strings & Memory Layout (Stack vs Heap)",
        "subtitle": "How objects, arrays, Compressed OOPs, and String Constant Pool differ from stack primitives.",
        "takeaways": [
          "Reference types (Classes, Interfaces, Arrays, Enums) store 4-byte (with Compressed OOPs) or 8-byte memory address pointers on the Stack pointing to objects on the Heap.",
          "Every Heap object incurs a 12-to-16 byte Object Header containing a Mark Word (hashcode, GC age, lock state) and Klass Word (class metadata pointer).",
          "String Immutability & SCP: `String` is an immutable reference type backed by the JVM String Constant Pool (SCP) in Heap memory to deduplicate identical literals.",
          "Generational Garbage Collection: Unreferenced Heap objects are automatically identified via GC Roots reachability and reclaimed by generational collectors (G1, ZGC).",
          "Java is strictly Pass-by-Value: Passing an object to a method copies the 32/64-bit memory address pointer by value—never the underlying heap memory instance."
        ],
        "codeOrDiagram": "public class ReferenceTypesDemo {\n    public static void main(String[] args) {\n        // 1. Primitive: Copied directly by value\n        int a = 10;\n        int b = a; // Copied value: b gets 10\n        b = 20;    // 'a' remains 10 (completely isolated in Stack)\n\n        // 2. Reference Type: Copied memory address pointer\n        int[] arr1 = { 1, 2, 3 };\n        int[] arr2 = arr1; // Copies pointer address!\n        arr2[0] = 99;      // Mutates underlying heap array\n\n        // 3. String Constant Pool vs Heap Allocation\n        String s1 = \"Lumi\";\n        String s2 = \"Lumi\";\n        String s3 = new String(\"Lumi\");\n\n        System.out.println(\"s1 == s2: \" + (s1 == s2));       // true (shared SCP literal)\n        System.out.println(\"s1 == s3: \" + (s1 == s3));       // false (distinct Heap object)\n        System.out.println(\"s1.equals(s3): \" + s1.equals(s3)); // true (value equality)\n    }\n}",
        "realWorldIntuition": "Reference types (Classes, Interfaces, Arrays, Enums) store 4-byte (with Compressed OOPs) or 8-byte memory address pointers on the Stack pointing to objects on the Heap.",
        "narrationScript": "Slide 2: Reference Types, Strings & Memory Layout (Stack vs Heap). How objects, arrays, Compressed OOPs, and String Constant Pool differ from stack primitives. Key takeaways include: Reference types (Classes, Interfaces, Arrays, Enums) store 4-byte (with Compressed OOPs) or 8-byte memory address pointers on the Stack pointing to objects on the Heap. Furthermore, Every Heap object incurs a 12-to-16 byte Object Header containing a Mark Word (hashcode, GC age, lock state) and Klass Word (class metadata pointer). Furthermore, String Immutability & SCP: `String` is an immutable reference type backed by the JVM String Constant Pool (SCP) in Heap memory to deduplicate identical literals. Furthermore, Generational Garbage Collection: Unreferenced Heap objects are automatically identified via GC Roots reachability and reclaimed by generational collectors (G1, ZGC). Furthermore, Java is strictly Pass-by-Value: Passing an object to a method copies the 32/64-bit memory address pointer by value—never the underlying heap memory instance.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "So when I create a million Strings using literal syntax `\"Data\"`, Java only stores a single instance on the heap?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Spot on, Maya! That is the power of the String Constant Pool (SCP). But if you write `new String(\"Data\")`, you force the JVM to instantiate duplicate objects, wasting memory.",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "And what about arrays? Is an `int[]` an object or a primitive?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "In Java, ALL arrays are full-fledged Heap Objects containing an Object Header with an additional 4-byte `length` metadata field!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "Where are Java Object instances and Arrays stored during application execution?",
          "options": [
            "In Heap Memory (shared across all threads, managed by Garbage Collector)",
            "In Thread-Local Stack Frames",
            "In the CPU L1 Cache Registers exclusively",
            "In the MetaSpace classloader partition"
          ],
          "correctIndex": 0,
          "explanation": "All object instances and arrays in Java are dynamically allocated on the shared Heap Memory and managed by the Generational Garbage Collector."
        }
      },
      {
        "id": "scene-java-3",
        "slideNumber": 3,
        "title": "Slide 3: Type Casting & Conversion (Widening vs Narrowing)",
        "subtitle": "Implicit widening promotions, explicit narrowing truncation, and binary overflow arithmetic.",
        "takeaways": [
          "Widening Casting (Implicit / Automatic): Safe conversion from smaller to larger data types without explicit syntax (e.g. `int` to `long` or `float` to `double`).",
          "Narrowing Casting (Explicit / Lossy): Converting larger types into smaller types requires explicit `(type)` syntax and discards higher-order bits via truncation.",
          "Binary Numeric Promotion: The JVM automatically promotes `byte`, `short`, and `char` operands to 32-bit `int` before performing any arithmetic operations.",
          "Integer Overflow Wraparound: Integer bounds operate strictly in two's complement modular arithmetic without throwing exceptions: `Integer.MAX_VALUE + 1` wraps to `Integer.MIN_VALUE`.",
          "Floating-Point to Integer Truncation: Casting a `double` or `float` to an integral type strictly truncates fractional digits toward zero (does not round)."
        ],
        "codeOrDiagram": "public class TypeCastingDemo {\n    public static void main(String[] args) {\n        // 1. Widening: Automatic (No cast required)\n        int count = 100;\n        long bigCount = count;\n        double preciseVal = count;\n\n        // 2. Narrowing: Explicit cast required\n        double rawScore = 98.75;\n        int truncatedScore = (int) rawScore; // Value becomes 98\n\n        // 3. Overflow during Narrowing\n        int val = 130;\n        byte overflowedByte = (byte) val; // Discards top 24 bits -> becomes -126\n\n        // 4. Safe arithmetic with Math.addExact (Java 8+)\n        try {\n            int overflow = Math.addExact(Integer.MAX_VALUE, 1);\n        } catch (ArithmeticException ex) {\n            System.out.println(\"Caught detected overflow: \" + ex.getMessage());\n        }\n    }\n}",
        "realWorldIntuition": "Widening Casting (Implicit / Automatic): Safe conversion from smaller to larger data types without explicit syntax (e.g. `int` to `long` or `float` to `double`).",
        "narrationScript": "Slide 3: Type Casting & Conversion (Widening vs Narrowing). Implicit widening promotions, explicit narrowing truncation, and binary overflow arithmetic. Key takeaways include: Widening Casting (Implicit / Automatic): Safe conversion from smaller to larger data types without explicit syntax (e.g. `int` to `long` or `float` to `double`). Furthermore, Narrowing Casting (Explicit / Lossy): Converting larger types into smaller types requires explicit `(type)` syntax and discards higher-order bits via truncation. Furthermore, Binary Numeric Promotion: The JVM automatically promotes `byte`, `short`, and `char` operands to 32-bit `int` before performing any arithmetic operations. Furthermore, Integer Overflow Wraparound: Integer bounds operate strictly in two's complement modular arithmetic without throwing exceptions: `Integer.MAX_VALUE + 1` wraps to `Integer.MIN_VALUE`. Furthermore, Floating-Point to Integer Truncation: Casting a `double` or `float` to an integral type strictly truncates fractional digits toward zero (does not round).",
        "dialogue": [
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Why did `(byte) 130` turn into a negative number `-126`?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Because Java bytes are signed 8-bit integers (-128 to 127). The binary representation of 130 has a 1 in the 8th bit, which in two's complement arithmetic designates the sign bit as negative!",
            "isProfessor": true
          },
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "And that is why production systems use `Math.addExact()` or `Math.multiplyExact()` to fail-fast on financial balance overflows!",
            "isProfessor": false
          }
        ],
        "quiz": {
          "question": "What is 'Widening Primitive Conversion' (Implicit Type Casting) in Java?",
          "options": [
            "Automatic conversion of a smaller data type to a larger data type without loss of magnitude (e.g., int to long)",
            "Manual casting with parentheses to prevent compilation errors",
            "Converting an Object reference to its subclass",
            "Converting a double into an integer"
          ],
          "correctIndex": 0,
          "explanation": "Widening primitive conversion happens automatically when assigning a smaller numeric type (e.g. `byte` -> `short` -> `int` -> `long` -> `float` -> `double`) because the destination type has equal or larger bit capacity."
        }
      },
      {
        "id": "scene-java-4",
        "slideNumber": 4,
        "title": "Slide 4: Autoboxing, Cache Pools & Performance Pitfalls",
        "subtitle": "Wrapper objects, IntegerCache (-128 to 127), null unboxing NPEs, and high-frequency memory bloat.",
        "takeaways": [
          "Autoboxing & Unboxing: The compiler automatically transforms `int` to `Integer.valueOf(int)` and `Integer` to `Integer.intValue()`.",
          "The Integer Cache Pool: Java caches wrapper objects for values `-128` through `127` in `IntegerCache`, causing reference identity `==` to be true for 100 but false for 200.",
          "NullPointerException on Unboxing: Attempting to unbox a `null` wrapper object (e.g. `Integer count = null; int val = count;`) throws an immediate runtime NullPointerException.",
          "Memory Bloat of Wrapper Objects: Primitive `int` consumes 4 bytes on stack; `Integer` consumes 16 bytes on Heap + 4-8 byte pointer (400% memory overhead).",
          "Primitive Streams Optimization: Use `IntStream`, `LongStream`, and `DoubleStream` in high-throughput pipelines to completely bypass wrapper allocation overhead."
        ],
        "codeOrDiagram": "public class AutoboxingPitfallsDemo {\n    public static void main(String[] args) {\n        // 1. Integer Cache behavior\n        Integer a = 127;\n        Integer b = 127;\n        System.out.println(\"127 == 127: \" + (a == b)); // true (cached)\n\n        Integer x = 128;\n        Integer y = 128;\n        System.out.println(\"128 == 128: \" + (x == y)); // false (new heap objects!)\n        System.out.println(\"x.equals(y): \" + x.equals(y)); // true (value equality)\n\n        // 2. The Hidden 1-Billion Object Allocation Anti-Pattern\n        long start = System.currentTimeMillis();\n        Long sum = 0L; // BAD: Boxed Long in loop allocates millions of objects!\n        for (long i = 0; i < 1_000_000; i++) {\n            sum += i; // Unboxes sum, adds i, autoboxes new Long object!\n        }\n        long elapsed = System.currentTimeMillis() - start;\n        System.out.println(\"Boxed loop elapsed: \" + elapsed + \"ms (Allocated 1M objects)\");\n    }\n}",
        "realWorldIntuition": "Autoboxing & Unboxing: The compiler automatically transforms `int` to `Integer.valueOf(int)` and `Integer` to `Integer.intValue()`.",
        "narrationScript": "Slide 4: Autoboxing, Cache Pools & Performance Pitfalls. Wrapper objects, IntegerCache (-128 to 127), null unboxing NPEs, and high-frequency memory bloat. Key takeaways include: Autoboxing & Unboxing: The compiler automatically transforms `int` to `Integer.valueOf(int)` and `Integer` to `Integer.intValue()`. Furthermore, The Integer Cache Pool: Java caches wrapper objects for values `-128` through `127` in `IntegerCache`, causing reference identity `==` to be true for 100 but false for 200. Furthermore, NullPointerException on Unboxing: Attempting to unbox a `null` wrapper object (e.g. `Integer count = null; int val = count;`) throws an immediate runtime NullPointerException. Furthermore, Memory Bloat of Wrapper Objects: Primitive `int` consumes 4 bytes on stack; `Integer` consumes 16 bytes on Heap + 4-8 byte pointer (400% memory overhead). Furthermore, Primitive Streams Optimization: Use `IntStream`, `LongStream`, and `DoubleStream` in high-throughput pipelines to completely bypass wrapper allocation overhead.",
        "dialogue": [
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Wait, why does `127 == 127` return true, but `128 == 128` return false? That is terrifying!",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "This is one of the most famous Java interview traps! Java caches wrapper objects between -128 and 127 to save memory. Beyond 127, every autobox allocates a brand new object. Always use `.equals()` for wrappers!",
            "isProfessor": true
          },
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "And in high-throughput engines, never use boxed `Long` in loops. Replacing `Long sum` with primitive `long sum` makes your loops 20x faster with zero Garbage Collection overhead.",
            "isProfessor": false
          }
        ],
        "quiz": {
          "question": "What is the cached integer range pre-allocated by `Integer.valueOf()` in Java (Integer Cache Pool)?",
          "options": [
            "-128 to 127",
            "0 to 255",
            "-256 to 255",
            "-1024 to 1023"
          ],
          "correctIndex": 0,
          "explanation": "The JVM pre-allocates and caches `Integer` wrapper objects for the range `-128` to `127` in the `IntegerCache` inner class to avoid excessive heap allocations."
        }
      }
    ]
  },
  {
    "id": "raft-consensus",
    "title": "Distributed Systems: Raft Consensus & Byzantine Fault Tolerance",
    "subject": "Distributed Computing & Fault Tolerant Systems",
    "difficulty": "Advanced Systems Architecture",
    "duration": "30 mins",
    "tags": [
      "Distributed Systems",
      "Raft",
      "Consensus",
      "Fault Tolerance",
      "Paxos"
    ],
    "professor": {
      "name": "Prof. Vyomra",
      "role": "Lead AI Professor of Distributed Systems & Cloud Infrastructure",
      "avatar": "👨‍🏫"
    },
    "scenes": [
      {
        "id": "scene-raft-1",
        "slideNumber": 1,
        "title": "Slide 1: State Machine Replication & The Consensus Problem",
        "subtitle": "How distributed nodes agree on a deterministic log of state transitions under network delays and crash faults.",
        "takeaways": [
          "Consensus Invariant: All non-faulty nodes in a distributed cluster must agree on the identical sequence of state machine log entries in the identical order.",
          "Quorum Formula: A Raft cluster of N nodes requires a strict majority quorum of at least Q = floor(N/2) + 1 nodes to elect leaders and commit entries.",
          "Fail-Stop Model: Standard Raft assumes asynchronous non-byzantine networks where packets can be delayed, duplicated, or dropped, and nodes may crash and recover.",
          "State Machine Replication (SMR): Deterministic state machines started in the same initial state will produce the exact same final state when fed identical logs.",
          "Linearizability Guarantee: Raft provides linearizable (strongly consistent) client reads and writes across the entire distributed cluster."
        ],
        "codeOrDiagram": "// Raft State Machine Replication Invariant in Java\npublic class RaftNode {\n    private int currentTerm = 0;\n    private Integer votedFor = null;\n    private final List<LogEntry> log = new ArrayList<>();\n    private int commitIndex = 0;\n    private int lastApplied = 0;\n    \n    public synchronized boolean isQuorumReached(int matchCount, int clusterSize) {\n        int quorum = (clusterSize / 2) + 1;\n        return matchCount >= quorum;\n    }\n}",
        "realWorldIntuition": "Consensus Invariant: All non-faulty nodes in a distributed cluster must agree on the identical sequence of state machine log entries in the identical order.",
        "narrationScript": "Slide 1: State Machine Replication & The Consensus Problem. How distributed nodes agree on a deterministic log of state transitions under network delays and crash faults. Key takeaways include: Consensus Invariant: All non-faulty nodes in a distributed cluster must agree on the identical sequence of state machine log entries in the identical order. Furthermore, Quorum Formula: A Raft cluster of N nodes requires a strict majority quorum of at least Q = floor(N/2) + 1 nodes to elect leaders and commit entries. Furthermore, Fail-Stop Model: Standard Raft assumes asynchronous non-byzantine networks where packets can be delayed, duplicated, or dropped, and nodes may crash and recover. Furthermore, State Machine Replication (SMR): Deterministic state machines started in the same initial state will produce the exact same final state when fed identical logs. Furthermore, Linearizability Guarantee: Raft provides linearizable (strongly consistent) client reads and writes across the entire distributed cluster.",
        "dialogue": [
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Welcome to Distributed Systems! In State Machine Replication, as long as all servers execute the exact same sequence of log entries, they will arrive at the identical state.",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Professor, why can a 5-node cluster only tolerate 2 failures? Why not 3?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Great question, Alex! Because if 3 nodes fail, only 2 remain. 2 is not a strict majority of 5 (you need 3). If 2 nodes were allowed to make decisions, a network partition could create two separate majorities, causing catastrophic Split-Brain!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is the core objective of State Machine Replication (SMR) in distributed systems?",
          "options": [
            "To ensure all deterministic replica nodes execute the exact identical sequence of log commands in the identical order",
            "To duplicate the operating system kernel across all cluster nodes",
            "To eliminate all network latency between data centers",
            "To automatically restart crashed server instances"
          ],
          "correctIndex": 0,
          "explanation": "State Machine Replication guarantees that multiple distributed replica nodes running deterministic state machines process the exact same sequence of state transitions from an identical append-only log, arriving at identical state."
        }
      },
      {
        "id": "scene-raft-2",
        "slideNumber": 2,
        "title": "Slide 2: Leader Election & Randomized Heartbeat Timers",
        "subtitle": "Follower timeouts, RequestVote RPCs, term increments, and split-vote mitigation.",
        "takeaways": [
          "3 Node States: Every Raft node transitions between Follower (passive), Candidate (seeking votes), and Leader (active replication).",
          "Randomized Election Timers (150ms–300ms): Solves the split-vote problem by ensuring one follower times out and claims the election before competitors.",
          "Term Numbers as Logical Clocks: Terms detect obsolete information; any node receiving a message with a higher term immediately converts to Follower.",
          "Election Safety: At most one leader can be elected in any given term because each node grants at most one vote per term on a first-come basis.",
          "Leader Completeness: A candidate's log must be at least as up-to-date as the voter's log (higher lastLogTerm, or longer log) to receive a vote."
        ],
        "codeOrDiagram": "// RequestVote RPC Implementation in Java\npublic synchronized VoteResponse handleRequestVote(RequestVoteArgs args) {\n    if (args.term > this.currentTerm) {\n        this.currentTerm = args.term;\n        this.state = NodeState.FOLLOWER;\n        this.votedFor = null;\n    }\n    boolean canVote = (this.votedFor == null || this.votedFor == args.candidateId);\n    boolean isLogUpToDate = isCandidateLogUpToDate(args.lastLogTerm, args.lastLogIndex);\n    \n    if (args.term == this.currentTerm && canVote && isLogUpToDate) {\n        this.votedFor = args.candidateId;\n        resetElectionTimeout();\n        return new VoteResponse(this.currentTerm, true);\n    }\n    return new VoteResponse(this.currentTerm, false);\n}",
        "realWorldIntuition": "3 Node States: Every Raft node transitions between Follower (passive), Candidate (seeking votes), and Leader (active replication).",
        "narrationScript": "Slide 2: Leader Election & Randomized Heartbeat Timers. Follower timeouts, RequestVote RPCs, term increments, and split-vote mitigation. Key takeaways include: 3 Node States: Every Raft node transitions between Follower (passive), Candidate (seeking votes), and Leader (active replication). Furthermore, Randomized Election Timers (150ms–300ms): Solves the split-vote problem by ensuring one follower times out and claims the election before competitors. Furthermore, Term Numbers as Logical Clocks: Terms detect obsolete information; any node receiving a message with a higher term immediately converts to Follower. Furthermore, Election Safety: At most one leader can be elected in any given term because each node grants at most one vote per term on a first-come basis. Furthermore, Leader Completeness: A candidate's log must be at least as up-to-date as the voter's log (higher lastLogTerm, or longer log) to receive a vote.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "Why are randomized election timeouts between 150ms and 300ms so crucial?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Without randomization, if the leader dies, all followers would timeout at the exact same millisecond, vote for themselves, split the votes evenly, and get stuck in an endless loop of failed elections!",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "So the random timer guarantees one node wakes up first and collects votes before the others!",
            "isProfessor": false
          }
        ],
        "quiz": {
          "question": "What are the three distinct runtime states a Raft node can transition between?",
          "options": [
            "Follower, Candidate, Leader",
            "Master, Worker, Standby",
            "Primary, Secondary, Arbiter",
            "Active, Idle, Dead"
          ],
          "correctIndex": 0,
          "explanation": "A Raft node is always in one of three states: Follower (passive, responding to RPCs), Candidate (seeking votes during an election), or Leader (handling client requests and driving log replication)."
        }
      },
      {
        "id": "scene-raft-3",
        "slideNumber": 3,
        "title": "Slide 3: Log Replication, Commit Index & Two-Phase Commit",
        "subtitle": "AppendEntries RPC, log consistency check, leader append-only invariant, and committing entries.",
        "takeaways": [
          "AppendEntries RPC Pipeline: The leader receives client writes, assigns the current term and index, appends locally, and broadcasts to followers.",
          "Log Consistency Invariant: When sending AppendEntries, the leader includes `prevLogIndex` and `prevLogTerm`. If the follower does not match, it rejects.",
          "Leader Append-Only: A leader never overwrites or truncates its own log; it only appends new entries.",
          "Commitment Rule: An entry is committed once replicated on a majority of nodes in the current term. Followers commit up to `min(leaderCommit, lastNewEntryIndex)`.",
          "Automatic Follower Log Repair: If a follower's log diverges after a partition, the leader decrements `nextIndex` until a common ancestor is found, then overwrites."
        ],
        "codeOrDiagram": "// AppendEntries Log Replication in Java\npublic synchronized AppendEntriesResponse handleAppendEntries(AppendEntriesArgs args) {\n    if (args.term < this.currentTerm) return new AppendEntriesResponse(this.currentTerm, false);\n    \n    // Verify log consistency at prevLogIndex\n    if (args.prevLogIndex > 0) {\n        if (this.log.size() < args.prevLogIndex || this.log.get(args.prevLogIndex - 1).term != args.prevLogTerm) {\n            return new AppendEntriesResponse(this.currentTerm, false); // Mismatch! Retry\n        }\n    }\n    \n    // Append entries & truncate conflicting uncommitted tail\n    insertEntries(args.prevLogIndex, args.entries);\n    if (args.leaderCommit > this.commitIndex) {\n        this.commitIndex = Math.min(args.leaderCommit, this.log.size());\n        applyEntriesToStateMachine();\n    }\n    return new AppendEntriesResponse(this.currentTerm, true);\n}",
        "realWorldIntuition": "AppendEntries RPC Pipeline: The leader receives client writes, assigns the current term and index, appends locally, and broadcasts to followers.",
        "narrationScript": "Slide 3: Log Replication, Commit Index & Two-Phase Commit. AppendEntries RPC, log consistency check, leader append-only invariant, and committing entries. Key takeaways include: AppendEntries RPC Pipeline: The leader receives client writes, assigns the current term and index, appends locally, and broadcasts to followers. Furthermore, Log Consistency Invariant: When sending AppendEntries, the leader includes `prevLogIndex` and `prevLogTerm`. If the follower does not match, it rejects. Furthermore, Leader Append-Only: A leader never overwrites or truncates its own log; it only appends new entries. Furthermore, Commitment Rule: An entry is committed once replicated on a majority of nodes in the current term. Followers commit up to `min(leaderCommit, lastNewEntryIndex)`. Furthermore, Automatic Follower Log Repair: If a follower's log diverges after a partition, the leader decrements `nextIndex` until a common ancestor is found, then overwrites.",
        "dialogue": [
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "What happens if a follower crashed for 10 minutes and missed 50 log entries?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "When it reconnects, the leader detects the mismatch, steps back through the log using `nextIndex`, and streams all missing entries in order until the follower is 100% synchronized!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "Which RPC is used by the Raft Leader to both replicate log entries and send periodic heartbeats?",
          "options": [
            "`AppendEntries` RPC",
            "`RequestVote` RPC",
            "`InstallSnapshot` RPC",
            "`ReplicateLog` RPC"
          ],
          "correctIndex": 0,
          "explanation": "`AppendEntries` is the primary RPC used for log replication. When sent with an empty `entries[]` array, it serves as a periodic heartbeat to maintain leadership authority."
        }
      },
      {
        "id": "scene-raft-4",
        "slideNumber": 4,
        "title": "Slide 4: Network Partitions, Split-Brain Protection & Joint Consensus",
        "subtitle": "Minority vs majority partitions, higher term precedence, log overwrites, and cluster membership changes.",
        "takeaways": [
          "Split-Brain Prevention: In a partition, only the partition containing a strict majority (> N/2) can elect a leader or commit writes; the minority partition stalls safely.",
          "Higher Term Precedence: When a partition heals, the old leader in the minority sees the higher term from the majority leader and steps down to Follower immediately.",
          "Log Overwrite Invariant: Uncommitted entries generated in a minority partition are safely discarded and overwritten by the majority leader's authoritative log.",
          "Joint Consensus Configuration Changes: Safely adding or removing nodes requires a two-phase transition where both old and new configurations must grant majorities.",
          "Linearizable Reads (ReadIndex / LeaseRead): The leader must exchange heartbeats with a majority before returning read data to ensure it hasn't been deposed."
        ],
        "codeOrDiagram": "// Raft Joint Consensus Membership Change Configuration\npublic class ClusterConfig {\n    private Set<NodeId> oldServers; // Cold\n    private Set<NodeId> newServers; // Cnew\n    private boolean inJointConsensus = false;\n    \n    public boolean isQuorum(Set<NodeId> acks) {\n        if (!inJointConsensus) {\n            return countAcks(acks, oldServers) > oldServers.size() / 2;\n        }\n        // Joint Consensus requires majorities from BOTH Cold and Cnew!\n        boolean oldQuorum = countAcks(acks, oldServers) > oldServers.size() / 2;\n        boolean newQuorum = countAcks(acks, newServers) > newServers.size() / 2;\n        return oldQuorum && newQuorum;\n    }\n}",
        "realWorldIntuition": "Split-Brain Prevention: In a partition, only the partition containing a strict majority (> N/2) can elect a leader or commit writes; the minority partition stalls safely.",
        "narrationScript": "Slide 4: Network Partitions, Split-Brain Protection & Joint Consensus. Minority vs majority partitions, higher term precedence, log overwrites, and cluster membership changes. Key takeaways include: Split-Brain Prevention: In a partition, only the partition containing a strict majority (> N/2) can elect a leader or commit writes; the minority partition stalls safely. Furthermore, Higher Term Precedence: When a partition heals, the old leader in the minority sees the higher term from the majority leader and steps down to Follower immediately. Furthermore, Log Overwrite Invariant: Uncommitted entries generated in a minority partition are safely discarded and overwritten by the majority leader's authoritative log. Furthermore, Joint Consensus Configuration Changes: Safely adding or removing nodes requires a two-phase transition where both old and new configurations must grant majorities. Furthermore, Linearizable Reads (ReadIndex / LeaseRead): The leader must exchange heartbeats with a majority before returning read data to ensure it hasn't been deposed.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "This mathematical quorum rule is brilliant. It completely eliminates data corruption during network splits!",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Indeed, Maya! Because any two majorities of size > N/2 MUST overlap in at least one node, it is impossible for two conflicting leaders to commit divergent data simultaneously.",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is a 'Network Partition' in a distributed system?",
          "options": [
            "A network failure that divides communicating nodes into two or more isolated subsets unable to exchange messages",
            "Partitioning a hard drive into multiple volumes",
            "Splitting a database table into shards",
            "Allocating IP addresses via DHCP"
          ],
          "correctIndex": 0,
          "explanation": "A network partition splits a distributed cluster into disconnected network components, preventing messages from traversing between the partitions."
        }
      }
    ]
  },
  {
    "id": "b-tree-indexing",
    "title": "Database Internals: B+ Tree Indexing & Disk Page Architecture",
    "subject": "Database Engineering & Storage Engines",
    "difficulty": "Advanced Systems Architecture",
    "duration": "25 mins",
    "tags": [
      "DBMS",
      "B+ Tree",
      "Indexing",
      "Disk I/O",
      "Buffer Pool",
      "InnoDB"
    ],
    "professor": {
      "name": "Prof. Vyomra",
      "role": "Lead AI Professor of Database Systems & Storage Engines",
      "avatar": "👨‍🏫"
    },
    "scenes": [
      {
        "id": "scene-btree-1",
        "slideNumber": 1,
        "title": "Slide 1: Disk Hardware Mechanics & Why Binary Search Trees Fail",
        "subtitle": "Page transfers (4KB/16KB), random vs sequential I/O latency, and high fan-out index trees.",
        "takeaways": [
          "Disk Block I/O: Operating systems and SSD/HDD storage controllers transfer data strictly in fixed-size blocks (4KB OS pages, 16KB InnoDB database pages).",
          "Binary Tree Disk Failure: A binary search tree has fan-out of 2; searching 10M rows requires ~24 random disk seeks, taking seconds on physical storage.",
          "B+ Tree High Fan-Out (B = 500 to 1000): Flattening the tree height to 3 or 4 levels ensures any record among 100 million rows is found in 3-4 page reads.",
          "Random vs Sequential I/O Gap: Sequential page scans saturate NVMe bandwidth (~7 GB/s); random seeks suffer from flash block remapping and rotational latency.",
          "The Buffer Pool (Page Cache): Caches disk pages in RAM using LRU/Clock algorithms, serving hot queries with zero disk I/O."
        ],
        "codeOrDiagram": "// Storage Engine B+ Tree Page Constants (InnoDB-style)\npublic class BPlusTreeConfig {\n    public static final int PAGE_SIZE = 16 * 1024; // 16 KB fixed disk page\n    public static final int KEY_SIZE = 8;          // 8-byte BIGINT primary key\n    public static final int POINTER_SIZE = 6;      // 6-byte page address offset\n    \n    // Fan-out factor: Number of keys per internal node\n    public static final int FAN_OUT = PAGE_SIZE / (KEY_SIZE + POINTER_SIZE); // ~1,170 keys!\n}",
        "realWorldIntuition": "Disk Block I/O: Operating systems and SSD/HDD storage controllers transfer data strictly in fixed-size blocks (4KB OS pages, 16KB InnoDB database pages).",
        "narrationScript": "Slide 1: Disk Hardware Mechanics & Why Binary Search Trees Fail. Page transfers (4KB/16KB), random vs sequential I/O latency, and high fan-out index trees. Key takeaways include: Disk Block I/O: Operating systems and SSD/HDD storage controllers transfer data strictly in fixed-size blocks (4KB OS pages, 16KB InnoDB database pages). Furthermore, Binary Tree Disk Failure: A binary search tree has fan-out of 2; searching 10M rows requires ~24 random disk seeks, taking seconds on physical storage. Furthermore, B+ Tree High Fan-Out (B = 500 to 1000): Flattening the tree height to 3 or 4 levels ensures any record among 100 million rows is found in 3-4 page reads. Furthermore, Random vs Sequential I/O Gap: Sequential page scans saturate NVMe bandwidth (~7 GB/s); random seeks suffer from flash block remapping and rotational latency. Furthermore, The Buffer Pool (Page Cache): Caches disk pages in RAM using LRU/Clock algorithms, serving hot queries with zero disk I/O.",
        "dialogue": [
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Welcome scholars! Today we unlock the foundational data structure behind MySQL InnoDB, PostgreSQL, Oracle, and SQLite: The B+ Tree.",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Professor, why can't we just use a Red-Black Tree or HashMap on disk?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Because memory hardware is physical! CPUs read disks in 4KB/16KB page chunks. A binary tree wastes 99.9% of that page and forces 24 slow random disk seeks. A B+ Tree packs 1,000 keys per page, finding any record in 3 reads!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "Why do in-memory Binary Search Trees (e.g. Red-Black Trees, AVL Trees) perform terribly as on-disk database indices?",
          "options": [
            "Each tree node holds only 1 key and 2 pointers; a tree of 10M records has height ~24, requiring 24 separate high-latency random disk I/O seeks per query",
            "Binary trees cannot store integer keys",
            "Disk storage does not support pointer addresses",
            "Operating systems disable binary search on disk drives"
          ],
          "correctIndex": 0,
          "explanation": "Binary trees have a tiny fan-out of 2. Traversal on disk requires $\\log_2 N$ random disk seeks (e.g. ~24 I/O operations for 16M rows). At 10ms per HDD seek, a single query would take 240ms."
        }
      },
      {
        "id": "scene-btree-2",
        "slideNumber": 2,
        "title": "Slide 2: B+ Tree Node Layout & Invariants (Order M)",
        "subtitle": "Internal routing nodes vs leaf data nodes, slotted page formats, and minimum occupancy rules.",
        "takeaways": [
          "Order M Invariant: An internal node in a B+ Tree of order M has at most M child pointers and M-1 keys; non-root nodes must hold at least ceil(M/2) pointers.",
          "Data Separation: Internal nodes store ONLY routing separator keys and child page IDs; 100% of actual row data resides in Leaf nodes.",
          "Slotted Page Architecture: Each 16KB disk page contains a fixed page header, slot array offset table, and variable-length record payload.",
          "Perfect Tree Balance: Every leaf node in a B+ Tree is at the exact same depth from the root, guaranteeing deterministic O(log_B N) lookups.",
          "Fill Factor Tuning: Leaves are initialized with 70–90% fill factor to leave headroom for sequential inserts without triggering immediate page splits."
        ],
        "codeOrDiagram": "// B+ Tree Internal Node binary search within a single disk page\npublic class BPlusTreeNode {\n    private int[] keys;       // Sorted keys array\n    private long[] childPageIds; // Child disk page pointers\n    private int numKeys;\n    \n    public long findChildPage(int searchKey) {\n        // Fast binary search on CPU within the 16KB in-memory page\n        int low = 0, high = numKeys - 1;\n        while (low <= high) {\n            int mid = (low + high) >>> 1;\n            if (keys[mid] <= searchKey) low = mid + 1;\n            else high = mid - 1;\n        }\n        return childPageIds[low]; // Points to next depth page\n    }\n}",
        "realWorldIntuition": "Order M Invariant: An internal node in a B+ Tree of order M has at most M child pointers and M-1 keys; non-root nodes must hold at least ceil(M/2) pointers.",
        "narrationScript": "Slide 2: B+ Tree Node Layout & Invariants (Order M). Internal routing nodes vs leaf data nodes, slotted page formats, and minimum occupancy rules. Key takeaways include: Order M Invariant: An internal node in a B+ Tree of order M has at most M child pointers and M-1 keys; non-root nodes must hold at least ceil(M/2) pointers. Furthermore, Data Separation: Internal nodes store ONLY routing separator keys and child page IDs; 100% of actual row data resides in Leaf nodes. Furthermore, Slotted Page Architecture: Each 16KB disk page contains a fixed page header, slot array offset table, and variable-length record payload. Furthermore, Perfect Tree Balance: Every leaf node in a B+ Tree is at the exact same depth from the root, guaranteeing deterministic O(log_B N) lookups. Furthermore, Fill Factor Tuning: Leaves are initialized with 70–90% fill factor to leave headroom for sequential inserts without triggering immediate page splits.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "Why are keys stored in sorted order inside each individual page?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "So the CPU can perform an instant binary search in nanoseconds once the page is loaded into the RAM Buffer Pool!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "In a B+ Tree of Order $M$, what is the maximum number of child pointers an internal node can hold?",
          "options": [
            "$M$ child pointers (and $M-1$ keys)",
            "$2M$ child pointers",
            "$M+1$ child pointers",
            "Unlimited"
          ],
          "correctIndex": 0,
          "explanation": "In a B+ Tree of order $M$, each internal node contains at most $M$ child pointers and $M-1$ separator keys."
        }
      },
      {
        "id": "scene-btree-3",
        "slideNumber": 3,
        "title": "Slide 3: Search, Insertion & Node Splitting Mechanics",
        "subtitle": "Exact key lookups, leaf overflow splitting, parent key promotion, and tree height growth.",
        "takeaways": [
          "Search Traversal: Starts at root page, binary searches keys to choose child page pointer, repeating until reaching target leaf page in O(log_B N).",
          "Leaf Page Split: When inserting into a full leaf page, the page splits 50/50; a copy of the middle key is promoted to the parent internal node.",
          "Internal Node Split: When an internal node overflows, the middle key is moved up into its parent (not copied) and removed from the level.",
          "Tree Growth from the Top: A B+ Tree grows in height only when the ROOT node splits, creating a new root with 2 pointers.",
          "Sequential vs Random Insertion: Monotonically increasing primary keys (AUTO_INCREMENT, UUIDv7) append to the rightmost leaf with zero page splits."
        ],
        "codeOrDiagram": "// B+ Tree Leaf Page Split Simulation\npublic void insertKey(int key, byte[] recordData) {\n    if (isPageFull()) {\n        // 1. Allocate new leaf page in buffer pool\n        BPlusTreeLeafPage newPage = allocateNewPage();\n        \n        // 2. Distribute keys evenly (50/50 split)\n        int splitIndex = this.records.size() / 2;\n        newPage.records.addAll(this.records.subList(splitIndex, this.records.size()));\n        this.records.subList(splitIndex, this.records.size()).clear();\n        \n        // 3. Update doubly-linked list\n        newPage.nextPageId = this.nextPageId;\n        this.nextPageId = newPage.pageId;\n        \n        // 4. Promote separator key to parent\n        parent.insertChildPointer(newPage.records.get(0).key, newPage.pageId);\n    }\n}",
        "realWorldIntuition": "Search Traversal: Starts at root page, binary searches keys to choose child page pointer, repeating until reaching target leaf page in O(log_B N).",
        "narrationScript": "Slide 3: Search, Insertion & Node Splitting Mechanics. Exact key lookups, leaf overflow splitting, parent key promotion, and tree height growth. Key takeaways include: Search Traversal: Starts at root page, binary searches keys to choose child page pointer, repeating until reaching target leaf page in O(log_B N). Furthermore, Leaf Page Split: When inserting into a full leaf page, the page splits 50/50; a copy of the middle key is promoted to the parent internal node. Furthermore, Internal Node Split: When an internal node overflows, the middle key is moved up into its parent (not copied) and removed from the level. Furthermore, Tree Growth from the Top: A B+ Tree grows in height only when the ROOT node splits, creating a new root with 2 pointers. Furthermore, Sequential vs Random Insertion: Monotonically increasing primary keys (AUTO_INCREMENT, UUIDv7) append to the rightmost leaf with zero page splits.",
        "dialogue": [
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Why is inserting random UUIDs (UUIDv4) as primary keys considered a terrible database anti-pattern?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Because random UUIDs land in random leaf pages all across your 500GB database! This forces constant random page splits, destroys page fill factor, and thrashes your disk I/O. Always use sequential IDs or UUIDv7!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What triggers a 'Leaf Page Split' during a B+ Tree key insertion?",
          "options": [
            "Attempting to insert a key into a leaf node that has already reached its maximum capacity ($M-1$ keys / full page)",
            "When a transaction commits",
            "When the database buffer pool runs out of memory",
            "When the operating system reboots"
          ],
          "correctIndex": 0,
          "explanation": "When a new key is inserted into a leaf node that is completely full, the node overflows and must split into two separate leaf pages, distributing keys evenly and pushing a copy of the middle key to the parent."
        }
      },
      {
        "id": "scene-btree-4",
        "slideNumber": 4,
        "title": "Slide 4: Leaf Node Doubly-Linked Lists & Range Query Efficiency",
        "subtitle": "Sequential leaf scans, Clustered vs Secondary indices, covering queries, and index condition pushdown.",
        "takeaways": [
          "Doubly-Linked Leaf Chain: All leaf pages link to next and previous siblings, allowing range queries (`BETWEEN`, `>`, `<`) to execute via sequential scans with zero re-traversal.",
          "Clustered Index: The primary key index IS the table itself; leaf pages store full row column tuples.",
          "Secondary Index: Secondary index leaf pages store only indexed column keys plus the Clustered Primary Key value (Bookmark Lookup).",
          "Covering Index Optimization: When an index contains all requested columns in a SELECT query, the DBMS satisfies the query directly from index pages without table lookups.",
          "Index Condition Pushdown (ICP): Pushes `WHERE` filtering logic down into the storage engine leaf scan to avoid fetching unnecessary table rows."
        ],
        "codeOrDiagram": "// Range Query Execution via Leaf Page Pointers\npublic List<Row> executeRangeScan(int startKey, int endKey) {\n    List<Row> results = new ArrayList<>();\n    \n    // 1. Traverse to first leaf node\n    BPlusTreeLeafPage currentLeaf = findLeafPage(startKey);\n    \n    // 2. Iterate along leaf linked list until endKey reached\n    while (currentLeaf != null) {\n        for (Row row : currentLeaf.records) {\n            if (row.key > endKey) return results; // Finished range!\n            if (row.key >= startKey) results.add(row);\n        }\n        currentLeaf = getPageFromBufferPool(currentLeaf.nextPageId); // Zero-seek pointer!\n    }\n    return results;\n}",
        "realWorldIntuition": "Doubly-Linked Leaf Chain: All leaf pages link to next and previous siblings, allowing range queries (`BETWEEN`, `>`, `<`) to execute via sequential scans with zero re-traversal.",
        "narrationScript": "Slide 4: Leaf Node Doubly-Linked Lists & Range Query Efficiency. Sequential leaf scans, Clustered vs Secondary indices, covering queries, and index condition pushdown. Key takeaways include: Doubly-Linked Leaf Chain: All leaf pages link to next and previous siblings, allowing range queries (`BETWEEN`, `>`, `<`) to execute via sequential scans with zero re-traversal. Furthermore, Clustered Index: The primary key index IS the table itself; leaf pages store full row column tuples. Furthermore, Secondary Index: Secondary index leaf pages store only indexed column keys plus the Clustered Primary Key value (Bookmark Lookup). Furthermore, Covering Index Optimization: When an index contains all requested columns in a SELECT query, the DBMS satisfies the query directly from index pages without table lookups. Furthermore, Index Condition Pushdown (ICP): Pushes `WHERE` filtering logic down into the storage engine leaf scan to avoid fetching unnecessary table rows.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "This is why B+ Trees are superior to standard B-Trees for SQL databases! In a B-Tree, range queries have to walk up and down parents repeatedly.",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Spot on, Maya! The leaf node doubly-linked list transforms complex range filters and `ORDER BY` sorting into blazing-fast sequential disk scans.",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "How does a B+ Tree execute a range query such as `SELECT * FROM orders WHERE order_date BETWEEN '2026-01-01' AND '2026-03-31'`?",
          "options": [
            "Traverse tree once ($\\\\mathcal{O}(\\\\log_B N)$) to find the start key ('2026-01-01'), then scan sequentially along leaf node sibling pointers until reaching '2026-03-31'",
            "Perform a separate root-to-leaf tree search for every single date in the range",
            "Perform a full table scan across all unindexed disk pages",
            "Load the entire database into memory and sort it"
          ],
          "correctIndex": 0,
          "explanation": "B+ Trees excel at range queries: a single root-to-leaf search finds the first record, followed by an ultra-fast sequential scan along the doubly-linked leaf chain."
        }
      }
    ]
  },
  {
    "id": "llm-transformers",
    "title": "LLM Architecture: Multi-Head Attention, RoPE & PagedAttention KV Cache",
    "subject": "Artificial Intelligence & Large Language Model Systems",
    "difficulty": "Mastery / Advanced AI Systems",
    "duration": "35 mins",
    "tags": [
      "LLM",
      "Transformers",
      "Attention",
      "RoPE",
      "KV Cache",
      "vLLM",
      "PagedAttention"
    ],
    "professor": {
      "name": "Prof. Vyomra",
      "role": "Lead AI Professor of Deep Learning & Transformer Architectures",
      "avatar": "👨‍🏫"
    },
    "scenes": [
      {
        "id": "scene-llm-1",
        "slideNumber": 1,
        "title": "Slide 1: The Attention Mechanism & Scaled Dot-Product Formulation",
        "subtitle": "Query, Key, Value tensor projections, scaling factor sqrt(d_k), and quadratic O(L^2) attention complexity.",
        "takeaways": [
          "Scaled Dot-Product Attention: Computes dynamic contextual attention weights between all token pairs using query-key similarity scaled by 1/sqrt(d_k).",
          "The Scaling Factor: For large head dimensions d_k, dot products grow large in magnitude, pushing the softmax function into regions with vanishing gradients.",
          "Semantic Roles: Query represents \"what I am searching for\", Key represents \"what attributes I contain\", and Value represents \"what content to transfer\".",
          "Quadratic Complexity O(L^2): Standard self-attention scales quadratically with sequence length L in both compute FLOPS and attention matrix memory.",
          "Causal Masking (Upper Triangle): Autoregressive decoder models apply a -inf mask to future token positions to enforce strictly forward causal prediction."
        ],
        "codeOrDiagram": "import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V, causal_mask=True):\n    d_k = Q.shape[-1]\n    # 1. Compute similarity logits\n    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)\n    \n    # 2. Apply causal upper-triangular mask\n    if causal_mask:\n        seq_len = Q.shape[-2]\n        mask = np.triu(np.ones((seq_len, seq_len)), k=1)\n        scores = np.where(mask == 1, -1e9, scores)\n        \n    # 3. Softmax & weighted Value sum\n    attention_weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))\n    attention_weights /= np.sum(attention_weights, axis=-1, keepdims=True)\n    return np.matmul(attention_weights, V)",
        "realWorldIntuition": "Scaled Dot-Product Attention: Computes dynamic contextual attention weights between all token pairs using query-key similarity scaled by 1/sqrt(d_k).",
        "narrationScript": "Slide 1: The Attention Mechanism & Scaled Dot-Product Formulation. Query, Key, Value tensor projections, scaling factor sqrt(d_k), and quadratic O(L^2) attention complexity. Key takeaways include: Scaled Dot-Product Attention: Computes dynamic contextual attention weights between all token pairs using query-key similarity scaled by 1/sqrt(d_k). Furthermore, The Scaling Factor: For large head dimensions d_k, dot products grow large in magnitude, pushing the softmax function into regions with vanishing gradients. Furthermore, Semantic Roles: Query represents \"what I am searching for\", Key represents \"what attributes I contain\", and Value represents \"what content to transfer\". Furthermore, Quadratic Complexity O(L^2): Standard self-attention scales quadratically with sequence length L in both compute FLOPS and attention matrix memory. Furthermore, Causal Masking (Upper Triangle): Autoregressive decoder models apply a -inf mask to future token positions to enforce strictly forward causal prediction.",
        "dialogue": [
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Welcome to LLM Systems Architecture! Today we dissect the mathematical heart of Modern AI: Self-Attention and Paged Memory.",
            "isProfessor": true
          },
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Professor, why do we divide by the square root of d_k? What happens if we skip it?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "If you skip dividing by sqrt(d_k), for large vector dimensions (like d_k = 128), the dot products blow up into hundreds. Softmax exponentiates those into massive numbers, saturating outputs to 1 and 0, which completely destroys backpropagation gradients!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is the standard mathematical formulation for Scaled Dot-Product Attention in Transformer architectures?",
          "options": [
            "$$\\\\text{Attention}(Q, K, V) = \\\\text{softmax}\\\\left(\\\\frac{QK^T}{\\\\sqrt{d_k}}\\\\right)V$$",
            "$$\\\\text{Attention}(Q, K, V) = \\\\text{sigmoid}(Q + K) \\\\times V$$",
            "$$\\\\text{Attention}(Q, K, V) = \\\\text{ReLU}(QK^T) + V$$",
            "$$\\\\text{Attention}(Q, K, V) = \\\\frac{Q \\\\cdot K \\\\cdot V}{d_k}$$"
          ],
          "correctIndex": 0,
          "explanation": "Scaled Dot-Product Attention computes query-key similarity matrix $QK^T$, scales by $1/\\\\sqrt{d_k}$, applies softmax row-wise to obtain attention weights, and computes the weighted sum of values $V$."
        }
      },
      {
        "id": "scene-llm-2",
        "slideNumber": 2,
        "title": "Slide 2: Multi-Head Attention & Subspace Representation Projections",
        "subtitle": "Parallel subspace attention heads, Multi-Query (MQA), and Grouped-Query Attention (GQA).",
        "takeaways": [
          "Multi-Head Attention (MHA): Splitting embeddings across h heads allows the network to simultaneously attend to syntax, facts, coreferences, and long-range dependencies.",
          "Head Projections: Queries, Keys, and Values are projected into d_k = d_model / h dimensional spaces, concatenated, and projected through W_O.",
          "Multi-Query Attention (MQA): Shares a single Key and Value head across all Query heads to reduce KV cache memory by h-fold.",
          "Grouped-Query Attention (GQA): Partitions Q heads into G groups sharing KV heads (e.g. 8 KV heads for 32 Q heads in LLaMA-3), balancing speed and accuracy.",
          "Memory Bandwidth Wall: In autoregressive generation, memory bandwidth to transfer KV caches dominates compute time, making GQA standard in modern LLMs."
        ],
        "codeOrDiagram": "// PyTorch-style Grouped-Query Attention (GQA) Head Projection\npublic class GroupedQueryAttention {\n    private final int numQHeads = 32;\n    private final int numKVHeads = 8; // GQA-8 (4 Q heads per 1 KV head)\n    private final int headDim = 128;\n    \n    public int computeKVCacheBytesPerToken(int numLayers) {\n        // 2 tensors (K and V) * numKVHeads * headDim * 2 bytes (FP16)\n        int bytesPerLayer = 2 * numKVHeads * headDim * 2; // 4,096 bytes/layer\n        return bytesPerLayer * numLayers; // 131 KB per token across 32 layers\n    }\n}",
        "realWorldIntuition": "Multi-Head Attention (MHA): Splitting embeddings across h heads allows the network to simultaneously attend to syntax, facts, coreferences, and long-range dependencies.",
        "narrationScript": "Slide 2: Multi-Head Attention & Subspace Representation Projections. Parallel subspace attention heads, Multi-Query (MQA), and Grouped-Query Attention (GQA). Key takeaways include: Multi-Head Attention (MHA): Splitting embeddings across h heads allows the network to simultaneously attend to syntax, facts, coreferences, and long-range dependencies. Furthermore, Head Projections: Queries, Keys, and Values are projected into d_k = d_model / h dimensional spaces, concatenated, and projected through W_O. Furthermore, Multi-Query Attention (MQA): Shares a single Key and Value head across all Query heads to reduce KV cache memory by h-fold. Furthermore, Grouped-Query Attention (GQA): Partitions Q heads into G groups sharing KV heads (e.g. 8 KV heads for 32 Q heads in LLaMA-3), balancing speed and accuracy. Furthermore, Memory Bandwidth Wall: In autoregressive generation, memory bandwidth to transfer KV caches dominates compute time, making GQA standard in modern LLMs.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "Why is Grouped-Query Attention (GQA) used in almost all state-of-the-art open models like LLaMA-3 and Mistral?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Because in production LLM serving, GPU High Bandwidth Memory (HBM) fills up rapidly with the KV cache. GQA cuts the KV cache size by 75% with virtually zero loss in benchmark reasoning capability!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "Why does Multi-Head Attention (MHA) project queries, keys, and values into $h$ distinct subspace heads instead of using a single large attention head?",
          "options": [
            "To allow the model to simultaneously attend to information from different representation subspaces at different positions (e.g. syntax, coreference, factual relations)",
            "To reduce total parameter count",
            "Because single-head attention cannot run on GPUs",
            "To bypass the need for backpropagation"
          ],
          "correctIndex": 0,
          "explanation": "Multi-Head Attention splits the hidden dimension $d_{\\\\text{model}}$ into $h$ heads ($d_k = d_{\\\\text{model}} / h$). Each head specializes in capturing different semantic, syntactic, and relational dependencies in parallel."
        }
      },
      {
        "id": "scene-llm-3",
        "slideNumber": 3,
        "title": "Slide 3: Positional Embeddings: Sinusoidal vs Rotary (RoPE)",
        "subtitle": "Why transformers are permutation invariant, 2D complex subspace rotations, and relative distance decay.",
        "takeaways": [
          "Permutation Invariance: Without positional encoding, self-attention treats \"Dog bites man\" and \"Man bites dog\" as completely identical bag-of-words.",
          "Rotary Position Embedding (RoPE): Encodes position by multiplying 2D chunks of Query and Key vectors by rotation matrices proportional to token index m*theta.",
          "Relative Position Decay: The inner product <R_m q, R_n k> naturally decays as token distance |m - n| increases, matching natural language syntax.",
          "Zero Trainable Parameters: RoPE is a closed-form mathematical rotation introducing zero learned embedding weights.",
          "Context Window Scaling: RoPE base frequency scaling (theta = 500,000 in LLaMA-3) enables seamless context length extrapolation to 128K+ tokens."
        ],
        "codeOrDiagram": "import torch\n\ndef apply_rotary_pos_emb(x, freqs_cis):\n    # x: (batch, seq_len, n_heads, head_dim)\n    # Reshape x into complex pairs\n    x_complex = torch.view_as_complex(x.float().reshape(*x.shape[:-1], -1, 2))\n    # Multiply by complex rotation e^(i * m * theta)\n    x_rotated = x_complex * freqs_cis\n    # Convert back to real tensor\n    return torch.view_as_real(x_rotated).flatten(-2)",
        "realWorldIntuition": "Permutation Invariance: Without positional encoding, self-attention treats \"Dog bites man\" and \"Man bites dog\" as completely identical bag-of-words.",
        "narrationScript": "Slide 3: Positional Embeddings: Sinusoidal vs Rotary (RoPE). Why transformers are permutation invariant, 2D complex subspace rotations, and relative distance decay. Key takeaways include: Permutation Invariance: Without positional encoding, self-attention treats \"Dog bites man\" and \"Man bites dog\" as completely identical bag-of-words. Furthermore, Rotary Position Embedding (RoPE): Encodes position by multiplying 2D chunks of Query and Key vectors by rotation matrices proportional to token index m*theta. Furthermore, Relative Position Decay: The inner product <R_m q, R_n k> naturally decays as token distance |m - n| increases, matching natural language syntax. Furthermore, Zero Trainable Parameters: RoPE is a closed-form mathematical rotation introducing zero learned embedding weights. Furthermore, Context Window Scaling: RoPE base frequency scaling (theta = 500,000 in LLaMA-3) enables seamless context length extrapolation to 128K+ tokens.",
        "dialogue": [
          {
            "speaker": "Alex (Curious Skeptic)",
            "role": "Student Researcher",
            "avatar": "🧑‍💻",
            "text": "Why is RoPE superior to traditional positional embeddings that were simply added to input tokens?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Traditional additive embeddings destroy vector directionality at deeper layers. RoPE rotates vectors in 2D subspaces at every single attention layer, perfectly preserving relative geometric distances across thousands of tokens!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is Rotary Position Embedding (RoPE) and why is it used in modern LLMs (LLaMA, Mistral, Gemma)?",
          "options": [
            "A relative positional encoding technique that encodes position by rotating 2D subspace pairs of Query and Key vectors by an angle proportional to token position $m\\\\theta$",
            "A method to rotate GPU tensors in memory to prevent overheating",
            "A sinusoidal encoding added directly to word embeddings at layer 0",
            "A neural network that predicts next-token positions"
          ],
          "correctIndex": 0,
          "explanation": "RoPE (Su et al.) encodes position by multiplying 2D chunks of $Q$ and $K$ vectors by rotation matrices $R_{\\\\Theta, m}^d$. The inner product $\\\\langle R_m q, R_n k \\\\rangle$ naturally depends only on the relative distance $m - n$."
        }
      },
      {
        "id": "scene-llm-4",
        "slideNumber": 4,
        "title": "Slide 4: Autoregressive KV Caching & PagedAttention Virtual Memory",
        "subtitle": "The decoding memory wall, fragmentation elimination in vLLM, and zero-copy prefix sharing.",
        "takeaways": [
          "Autoregressive KV Cache: Stores past Key and Value tensors in GPU memory to avoid recomputing O(L^2) attention representations during token-by-token generation.",
          "The Memory Wall: In a 70B model, serving 16 users with 4k context consumes >20GB of GPU VRAM solely for the KV cache.",
          "Memory Fragmentation Problem: Traditional serving pre-allocates contiguous memory for max context, wasting 60–80% of GPU RAM due to internal and external fragmentation.",
          "PagedAttention (vLLM): Manages KV cache in non-contiguous physical memory blocks using OS-style page tables, eliminating fragmentation entirely.",
          "Copy-on-Write Prefix Sharing: Multiple parallel sampling branches or identical system prompts share the exact same physical memory blocks with zero duplicate RAM."
        ],
        "codeOrDiagram": "// PagedAttention Block Manager Simulation\npublic class PagedKVCacheManager {\n    private final int blockSize = 16; // 16 tokens per physical block\n    private final Map<Integer, List<Integer>> blockTables = new HashMap<>(); // seqId -> physicalBlockIds\n    private final Stack<Integer> freePhysicalBlocks = new Stack<>();\n    \n    public void allocateToken(int seqId, int tokenPosition) {\n        List<Integer> table = blockTables.computeIfAbsent(seqId, k -> new ArrayList<>());\n        if (tokenPosition % blockSize == 0) {\n            // Allocate new non-contiguous physical block on demand\n            int newBlockId = freePhysicalBlocks.pop();\n            table.add(newBlockId);\n        }\n    }\n}",
        "realWorldIntuition": "Autoregressive KV Cache: Stores past Key and Value tensors in GPU memory to avoid recomputing O(L^2) attention representations during token-by-token generation.",
        "narrationScript": "Slide 4: Autoregressive KV Caching & PagedAttention Virtual Memory. The decoding memory wall, fragmentation elimination in vLLM, and zero-copy prefix sharing. Key takeaways include: Autoregressive KV Cache: Stores past Key and Value tensors in GPU memory to avoid recomputing O(L^2) attention representations during token-by-token generation. Furthermore, The Memory Wall: In a 70B model, serving 16 users with 4k context consumes >20GB of GPU VRAM solely for the KV cache. Furthermore, Memory Fragmentation Problem: Traditional serving pre-allocates contiguous memory for max context, wasting 60–80% of GPU RAM due to internal and external fragmentation. Furthermore, PagedAttention (vLLM): Manages KV cache in non-contiguous physical memory blocks using OS-style page tables, eliminating fragmentation entirely. Furthermore, Copy-on-Write Prefix Sharing: Multiple parallel sampling branches or identical system prompts share the exact same physical memory blocks with zero duplicate RAM.",
        "dialogue": [
          {
            "speaker": "Maya (Performance Hacker)",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "PagedAttention brings the exact same virtual memory paging operating systems invented 50 years ago to GPU LLM inference!",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Exactly, Maya! By decoupling logical token sequences from contiguous physical GPU memory, vLLM eliminated memory fragmentation and doubled real-world LLM serving throughput globally.",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is the primary purpose of 'Key-Value (KV) Caching' during autoregressive LLM inference?",
          "options": [
            "To store previously computed Key and Value tensors in GPU memory so the model does not recompute attention representations for past tokens when generating each new token",
            "To cache user prompts in a Redis database",
            "To save generated text to disk",
            "To compress model weights from FP16 to INT4"
          ],
          "correctIndex": 0,
          "explanation": "During autoregressive decoding, tokens are generated one by one. Without KV caching, every step would recompute $Q, K, V$ for all preceding tokens ($\\\\mathcal{O}(L^2)$ computation per token). With KV caching, only the new token is computed ($\\\\mathcal{O}(L)$)."
        }
      }
    ]
  },
  {
    "id": "ml-llm-transformers",
    "title": "Machine Learning: Neural Networks, Transformers & LLMs",
    "subject": "Artificial Intelligence & Deep Learning",
    "difficulty": "Advanced",
    "duration": "30 mins",
    "tags": [
      "Machine Learning",
      "Transformers",
      "Neural Networks",
      "LLMs",
      "PyTorch"
    ],
    "professor": {
      "name": "Prof. Vyomra",
      "role": "Lead AI Professor of Artificial Intelligence & Neural Architectures",
      "avatar": "🧠"
    },
    "scenes": [
      {
        "id": "scene-ml-1",
        "slideNumber": 1,
        "title": "Slide 1: Self-Attention Mechanism & Transformer Architecture",
        "subtitle": "Query, Key, Value vector projections, Scaled Dot-Product Attention, and Multi-Head Attention equations.",
        "takeaways": [
          "Self-Attention computes contextual representations by projecting input embeddings into Query (Q), Key (K), and Value (V) matrices.",
          "Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Scaling by sqrt(d_k) prevents vanishing gradients.",
          "Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.",
          "Positional Encodings (Sinusoidal or Rotary RoPE) inject order information into token embeddings without recurrence."
        ],
        "codeOrDiagram": "import torch\nimport torch.nn as nn\nimport math\n\nclass SelfAttention(nn.Module):\n    def __init__(self, embed_dim, heads):\n        super().__init__()\n        self.embed_dim = embed_dim\n        self.heads = heads\n        self.head_dim = embed_dim // heads\n        \n        self.qkv = nn.Linear(embed_dim, embed_dim * 3)\n        self.fc_out = nn.Linear(embed_dim, embed_dim)\n        \n    def forward(self, x):\n        B, N, D = x.shape\n        qkv = self.qkv(x).reshape(B, N, 3, self.heads, self.head_dim).permute(2, 0, 3, 1, 4)\n        Q, K, V = qkv[0], qkv[1], qkv[2]\n        \n        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.head_dim)\n        attn = torch.softmax(scores, dim=-1)\n        out = torch.matmul(attn, V).permute(0, 2, 1, 3).reshape(B, N, D)\n        return self.fc_out(out)\n\nprint('Self-Attention Layer initialized successfully!')",
        "realWorldIntuition": "Self-Attention computes contextual representations by projecting input embeddings into Query (Q), Key (K), and Value (V) matrices.",
        "narrationScript": "Slide 1: Self-Attention Mechanism & Transformer Architecture. Query, Key, Value vector projections, Scaled Dot-Product Attention, and Multi-Head Attention equations. Key takeaways include: Self-Attention computes contextual representations by projecting input embeddings into Query (Q), Key (K), and Value (V) matrices. Furthermore, Scaled Dot-Product Attention formula: Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V. Scaling by sqrt(d_k) prevents vanishing gradients. Furthermore, Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions. Furthermore, Positional Encodings (Sinusoidal or Rotary RoPE) inject order information into token embeddings without recurrence.",
        "dialogue": [
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Welcome scholars! Today we dive into the core engine of modern LLMs: Self-Attention.",
            "isProfessor": true
          },
          {
            "speaker": "priya",
            "role": "Systems Enthusiast",
            "avatar": "👩‍💻",
            "text": "Professor, why do we scale the dot product by the square root of d_k inside the softmax?",
            "isProfessor": false
          },
          {
            "speaker": "Prof. Vyomra",
            "role": "Lead AI Professor",
            "avatar": "👨‍🏫",
            "text": "Excellent question, Priya! For large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) maintains unit variance!",
            "isProfessor": true
          }
        ],
        "quiz": {
          "question": "What is the purpose of dividing QK^T by sqrt(d_k) in Scaled Dot-Product Attention?",
          "options": [
            "To prevent the dot products from growing too large and causing vanishing gradients in softmax",
            "To reduce VRAM memory by half",
            "To convert floating point numbers to integers",
            "To make self-attention non-differentiable"
          ],
          "correctIndex": 0,
          "explanation": "Scaling by sqrt(d_k) normalizes the variance of the dot products to 1, preventing softmax saturation and vanishing gradients during backward propagation."
        }
      }
    ]
  }
];
