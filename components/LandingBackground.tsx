import Image from "next/image";
import landingPage from "@/components/landing/landingpage.png";

/**
 * Landing page background, fixed behind the whole page.
 * Flip MODE to switch:
 *   "mountains" – layered navy mountain ridges with drifting fog (pure SVG/CSS, no downloads)
 *   "video"     – the Flow brand clip: plays once, then holds its last frame
 *   "image"     – the last frame of that clip as a still
 * Colours for the mountain scene are the --mtn-* / --fog-* tokens in globals.css.
 */
const MODE: "mountains" | "video" | "image" = "mountains";

function Mountains() {
  return (
    <>
      {/* sky + ambient light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 72% 16%, var(--landing-glow), transparent 70%), radial-gradient(ellipse 50% 40% at 12% 8%, var(--fog-purple), transparent 70%), linear-gradient(to bottom, var(--landing-base) 0%, var(--landing-base-2) 75%, var(--landing-base) 100%)",
        }}
      />

      {/* mountains + the fog between the ridges */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-full w-full"
      >
        <defs>
          <linearGradient id="mtn-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--mtn-far-top)" }} />
            <stop offset="1" style={{ stopColor: "var(--mtn-far-bottom)" }} />
          </linearGradient>
          <linearGradient id="mtn-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--mtn-mid-top)" }} />
            <stop offset="1" style={{ stopColor: "var(--mtn-mid-bottom)" }} />
          </linearGradient>
          <linearGradient id="mtn-fog" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--fog-stop)", stopOpacity: 0 }} />
            <stop offset="0.55" style={{ stopColor: "var(--fog-stop)", stopOpacity: 0.11 }} />
            <stop offset="1" style={{ stopColor: "var(--fog-stop)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* far ridge */}
        <path
          d="M0 595 L6 591 L12 586 L18 579 L24 571 L30 563 L36 558 L42 552 L48 548 L54 542 L60 533 L66 524 L72 515 L78 511 L84 508 L90 502 L96 494 L102 486 L108 481 L114 471 L120 467 L126 461 L132 455 L138 448 L144 437 L150 435 L156 440 L162 448 L168 453 L174 460 L180 466 L186 475 L192 482 L198 489 L204 498 L210 504 L216 512 L222 518 L228 527 L234 526 L240 519 L246 514 L252 504 L258 499 L264 491 L270 487 L276 482 L282 478 L288 472 L294 465 L300 457 L306 455 L312 450 L318 445 L324 437 L330 429 L336 426 L342 431 L348 441 L354 449 L360 455 L366 459 L372 462 L378 468 L384 475 L390 480 L396 487 L402 492 L408 499 L414 503 L420 509 L426 514 L432 517 L438 521 L444 530 L450 534 L456 540 L462 546 L468 554 L474 559 L480 566 L486 570 L492 574 L498 570 L504 563 L510 557 L516 559 L522 564 L528 569 L534 574 L540 582 L546 589 L552 597 L558 602 L564 609 L570 611 L576 617 L582 613 L588 608 L594 601 L600 594 L606 589 L612 581 L618 573 L624 567 L630 563 L636 560 L642 552 L648 547 L654 541 L660 536 L666 533 L672 537 L678 543 L684 548 L690 557 L696 565 L702 570 L708 575 L714 578 L720 586 L726 593 L732 601 L738 601 L744 594 L750 587 L756 584 L762 578 L768 573 L774 566 L780 565 L786 563 L792 562 L798 558 L804 553 L810 548 L816 541 L822 536 L828 529 L834 524 L840 517 L846 513 L852 511 L858 511 L864 507 L870 498 L876 494 L882 488 L888 486 L894 479 L900 475 L906 469 L912 463 L918 456 L924 456 L930 461 L936 465 L942 472 L948 479 L954 484 L960 488 L966 490 L972 498 L978 501 L984 508 L990 510 L996 517 L1002 522 L1008 525 L1014 530 L1020 535 L1026 541 L1032 545 L1038 551 L1044 548 L1050 543 L1056 535 L1062 536 L1068 538 L1074 547 L1080 552 L1086 560 L1092 565 L1098 570 L1104 579 L1110 584 L1116 590 L1122 595 L1128 601 L1134 607 L1140 611 L1146 617 L1152 624 L1158 629 L1164 630 L1170 622 L1176 615 L1182 605 L1188 600 L1194 594 L1200 588 L1206 579 L1212 571 L1218 567 L1224 562 L1230 559 L1236 549 L1242 544 L1248 537 L1254 532 L1260 525 L1266 515 L1272 508 L1278 499 L1284 492 L1290 486 L1296 478 L1302 475 L1308 466 L1314 463 L1320 453 L1326 452 L1332 459 L1338 468 L1344 475 L1350 480 L1356 487 L1362 493 L1368 498 L1374 504 L1380 512 L1386 519 L1392 528 L1398 535 L1404 545 L1410 552 L1416 559 L1422 564 L1428 569 L1434 573 L1440 565 L1440 900 L0 900 Z"
          fill="url(#mtn-far)"
          style={{ stroke: "var(--mtn-rim)", strokeWidth: 1.5 }}
        />
        <rect x="0" y="560" width="1440" height="240" fill="url(#mtn-fog)" />

        {/* middle ridge */}
        <path
          d="M0 664 L6 667 L12 670 L18 675 L24 679 L30 685 L36 690 L42 695 L48 697 L54 703 L60 709 L66 713 L72 716 L78 711 L84 707 L90 702 L96 698 L102 693 L108 691 L114 688 L120 683 L126 677 L132 671 L138 667 L144 661 L150 658 L156 657 L162 662 L168 666 L174 670 L180 675 L186 679 L192 685 L198 692 L204 696 L210 700 L216 705 L222 710 L228 714 L234 716 L240 721 L246 726 L252 732 L258 733 L264 727 L270 721 L276 717 L282 714 L288 710 L294 704 L300 701 L306 696 L312 691 L318 685 L324 684 L330 690 L336 693 L342 698 L348 702 L354 706 L360 712 L366 716 L372 722 L378 725 L384 732 L390 737 L396 741 L402 736 L408 728 L414 723 L420 717 L426 711 L432 706 L438 701 L444 696 L450 690 L456 684 L462 679 L468 676 L474 683 L480 687 L486 693 L492 699 L498 704 L504 712 L510 718 L516 725 L522 728 L528 730 L534 734 L540 741 L546 749 L552 757 L558 762 L564 766 L570 770 L576 775 L582 781 L588 783 L594 780 L600 775 L606 769 L612 764 L618 761 L624 756 L630 752 L636 745 L642 741 L648 735 L654 732 L660 736 L666 739 L672 741 L678 747 L684 752 L690 759 L696 762 L702 764 L708 756 L714 749 L720 741 L726 735 L732 730 L738 724 L744 716 L750 709 L756 704 L762 699 L768 701 L774 705 L780 713 L786 720 L792 728 L798 733 L804 739 L810 747 L816 752 L822 759 L828 764 L834 760 L840 755 L846 750 L852 744 L858 738 L864 732 L870 728 L876 722 L882 715 L888 710 L894 704 L900 701 L906 695 L912 691 L918 685 L924 681 L930 676 L936 668 L942 673 L948 677 L954 685 L960 690 L966 693 L972 697 L978 703 L984 709 L990 714 L996 719 L1002 725 L1008 732 L1014 736 L1020 743 L1026 748 L1032 755 L1038 758 L1044 766 L1050 771 L1056 779 L1062 785 L1068 791 L1074 783 L1080 775 L1086 768 L1092 765 L1098 760 L1104 754 L1110 747 L1116 741 L1122 739 L1128 737 L1134 743 L1140 748 L1146 751 L1152 757 L1158 761 L1164 766 L1170 771 L1176 775 L1182 780 L1188 783 L1194 778 L1200 774 L1206 768 L1212 761 L1218 755 L1224 750 L1230 745 L1236 739 L1242 736 L1248 730 L1254 722 L1260 715 L1266 710 L1272 707 L1278 704 L1284 700 L1290 695 L1296 689 L1302 684 L1308 678 L1314 680 L1320 683 L1326 687 L1332 690 L1338 697 L1344 703 L1350 709 L1356 715 L1362 721 L1368 726 L1374 729 L1380 735 L1386 742 L1392 740 L1398 735 L1404 728 L1410 723 L1416 717 L1422 720 L1428 726 L1434 730 L1440 735 L1440 900 L0 900 Z"
          fill="url(#mtn-mid)"
        />
        <rect x="0" y="690" width="1440" height="170" fill="url(#mtn-fog)" />

        {/* near ridge */}
        <path
          d="M0 846 L6 850 L12 854 L18 859 L24 864 L30 868 L36 868 L42 865 L48 860 L54 853 L60 847 L66 841 L72 834 L78 828 L84 820 L90 815 L96 808 L102 805 L108 811 L114 818 L120 825 L126 831 L132 837 L138 843 L144 848 L150 856 L156 863 L162 870 L168 869 L174 868 L180 869 L186 868 L192 869 L198 870 L204 872 L210 872 L216 866 L222 859 L228 852 L234 846 L240 842 L246 836 L252 842 L258 848 L264 854 L270 859 L276 864 L282 869 L288 869 L294 869 L300 870 L306 868 L312 863 L318 856 L324 851 L330 848 L336 844 L342 839 L348 838 L354 844 L360 849 L366 854 L372 857 L378 861 L384 858 L390 853 L396 847 L402 840 L408 833 L414 827 L420 822 L426 815 L432 809 L438 804 L444 811 L450 818 L456 824 L462 831 L468 836 L474 841 L480 848 L486 854 L492 863 L498 870 L504 871 L510 870 L516 866 L522 860 L528 856 L534 851 L540 847 L546 842 L552 837 L558 832 L564 828 L570 825 L576 819 L582 814 L588 811 L594 817 L600 821 L606 826 L612 830 L618 834 L624 839 L630 846 L636 852 L642 856 L648 860 L654 853 L660 848 L666 842 L672 835 L678 829 L684 822 L690 819 L696 826 L702 832 L708 838 L714 845 L720 851 L726 858 L732 863 L738 869 L744 869 L750 871 L756 871 L762 869 L768 863 L774 858 L780 854 L786 851 L792 846 L798 841 L804 835 L810 830 L816 825 L822 822 L828 816 L834 813 L840 808 L846 810 L852 814 L858 819 L864 823 L870 828 L876 831 L882 837 L888 842 L894 847 L900 851 L906 854 L912 858 L918 863 L924 860 L930 856 L936 851 L942 844 L948 837 L954 832 L960 827 L966 821 L972 815 L978 820 L984 826 L990 831 L996 836 L1002 843 L1008 848 L1014 854 L1020 855 L1026 852 L1032 847 L1038 842 L1044 836 L1050 833 L1056 829 L1062 825 L1068 829 L1074 835 L1080 839 L1086 843 L1092 847 L1098 852 L1104 857 L1110 862 L1116 868 L1122 870 L1128 871 L1134 869 L1140 869 L1146 869 L1152 869 L1158 869 L1164 864 L1170 859 L1176 852 L1182 845 L1188 839 L1194 834 L1200 829 L1206 823 L1212 817 L1218 810 L1224 806 L1230 812 L1236 819 L1242 825 L1248 832 L1254 837 L1260 842 L1266 848 L1272 854 L1278 850 L1284 845 L1290 838 L1296 833 L1302 827 L1308 821 L1314 815 L1320 808 L1326 806 L1332 811 L1338 818 L1344 823 L1350 828 L1356 833 L1362 840 L1368 846 L1374 854 L1380 859 L1386 865 L1392 870 L1398 870 L1404 869 L1410 869 L1416 869 L1422 863 L1428 858 L1434 851 L1440 845 L1440 900 L0 900 Z"
          style={{ fill: "var(--mtn-near)" }}
        />
      </svg>

      {/* slow-drifting fog banks (static when motion is reduced; the second is hidden on phones) */}
      <div
        className="landing-fog absolute -left-[10%] bottom-[16%] h-[34%] w-[120%]"
        style={{ background: "radial-gradient(ellipse at 30% 50%, var(--fog-blue), transparent 65%)" }}
      />
      <div
        className="landing-fog absolute -left-[10%] bottom-[6%] h-[28%] w-[120%] max-sm:hidden"
        style={{
          background: "radial-gradient(ellipse at 75% 50%, var(--fog-purple), transparent 65%)",
          animationDirection: "alternate-reverse",
        }}
      />
    </>
  );
}

export function LandingBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-landing-base" aria-hidden="true">
      {MODE === "mountains" && <Mountains />}

      {MODE === "video" && (
        // No `loop`: when the clip ends the browser keeps showing its last frame.
        <video
          className="h-full w-full object-cover motion-reduce:hidden"
          src="/landing-bg.mp4"
          poster="/landing-bg-poster.jpg"
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      )}
     {MODE === "mountains" && (
  <>
    <Image
      src={landingPage}
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover object-center"
    />

    {/* Dark overlay for text readability */}
    <div
      className="absolute inset-0"
      style={{ background: "var(--landing-overlay)" }} />
        </>
      )}
    </div>
  );
}
