
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRfid8500ZebraSpec.h"

@interface Rfid8500Zebra : NSObject <NativeRfid8500ZebraSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Rfid8500Zebra : NSObject <RCTBridgeModule>
#endif

@end
