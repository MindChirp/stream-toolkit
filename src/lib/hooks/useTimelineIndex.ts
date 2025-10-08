export const useTimelineIndex = ({
  ecuFsmState,
  fcFsmState,
}: {
  ecuFsmState: number;
  fcFsmState: number;
}) => {
  if (ecuFsmState >= 0 && ecuFsmState <= 2 && fcFsmState == 0) {
    return ecuFsmState;
  } else if (ecuFsmState === 2 && fcFsmState >= 1 && fcFsmState <= 4) {
    return fcFsmState + 2;
  } else if (
    fcFsmState >= 4 &&
    fcFsmState <= 6 &&
    ecuFsmState >= 3 &&
    ecuFsmState <= 9
  ) {
    return ecuFsmState + 4;
  } else if (fcFsmState >= 7) {
    return fcFsmState + 7;
  }

  return undefined;
};

// Calculate the proper states to display
// if ecu >= 0 and ecu <= 2 and fc == 0:
// 			ret = ecu
// 			change = true

// 		elif ecu == 2 and fc >= 1 and fc <= 4:
// 			ret = fc + 2
// 			change = true

// 		elif fc >= 4 and fc <= 6 and ecu >= 3 and ecu <= 9:
// 			ret = ecu + 4
// 			change = true

// 		elif fc >= 7:
// 			ret = fc + 7
// 			change = true
